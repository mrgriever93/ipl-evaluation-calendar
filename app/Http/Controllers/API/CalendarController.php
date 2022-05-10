<?php

namespace App\Http\Controllers\API;

use App\Events\CalendarChanged;
use App\Events\CalendarDeleted;
use App\Events\CalendarPublished;
use App\Filters\CalendarFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewCalendarRequest;
use App\Http\Requests\PublishCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Http\Resources\AvailableCourseUnitsResource;
use App\Http\Resources\CalendarResource;
use App\Http\Resources\Generic\Calendar_SemesterResource;
use App\Http\Resources\Generic\EpochTypesResource;
use App\Http\Resources\Generic\SemestersSearchResource;
use App\Models\AcademicYear;
use App\Models\Calendar;
use App\Models\CalendarPhase;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use App\Models\EpochType;
use App\Models\Interruption;
use App\Models\InterruptionType;
use App\Models\InterruptionTypesEnum;
use App\Models\Semester;
use App\Services\ExternalImports;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CalendarController extends Controller
{
    public function index(Request $request, CalendarFilters $filters)
    {
        $calendars = Calendar::with(['course', 'phase'])->filter($filters);
        return CalendarResource::collection($calendars->ofAcademicYear($request->cookie('academic_year'))->orderBy('previous_calendar_id')->get());
    }

    public function store(NewCalendarRequest $request)
    {
        //dd($request->interruptions);
        $courses = $request->courses;
        if ($request->is_all_courses) {
            $courses = Course::all();
        }

        foreach ($courses as $key => $course) {
            $newCalendar = new Calendar($request->all());
            $newCalendar->academic_year_id = $request->cookie('academic_year');
            $newCalendar->semester_id = Semester::where('code', $request->semester)->firstOrFail()->id;
            $newCalendar->course_id = $course["id"] ?? $course;
            // TODO garantir que este valor e sempre o correto
            $newCalendar->calendar_phase_id = CalendarPhase::where('code', 'created')->firstOrFail()->id;
            $newCalendar->save();

            foreach ($request->epochs as $key => $epoch) {
                $epochType = EpochType::where('code', $epoch['code'])->firstOrFail();
                $newEpoch = new Epoch($epoch);
                $newEpoch->name = $epochType->name_pt;
                $newEpoch->epoch_type_id = $epochType->id;

                // Error creating new Calendar
                //$newCalendar->epochs()->save($newEpoch);
                $newEpoch->calendar_id = $newCalendar->id;
                $newEpoch->save();

                //foreach (CourseUnit::where('course_id', $newCalendar->course_id)->get() as $courseUnit) {
                //    foreach ($courseUnit->methods as $method) {
                //        $existingEpochToCopy = $method->epochs()->first();
                //        $isSameEpochType = !is_null($existingEpochToCopy) ? $existingEpochToCopy->epoch_type_id == $newEpoch->epoch_type_id : false;
                //        if ($isSameEpochType) {
                //            $method->epochs()->syncWithoutDetaching($newEpoch);
                //        }
                //    }
                //}
            }

            foreach ($request->interruptions as $key => $interruption) {
                $newInterruption = new Interruption($interruption);
                $newInterruption->calendar_id = $newCalendar->id;
                if (empty($interruption->description)) {
                    $newInterruption->description_pt = InterruptionType::find($interruption['interruption_type_id'])->name_pt;
                    $newInterruption->description_en = InterruptionType::find($interruption['interruption_type_id'])->name_en;
                }
                $newInterruption->save();
            }

            if ($request->holidays) {
                foreach ($request->holidays as $key => $holiday) {
                    $newInterruption = new Interruption();
                    $newInterruption->start_date            = $holiday['date'];
                    $newInterruption->end_date              = $holiday['date'];
                    $newInterruption->description_pt        = $holiday['name'];
                    $newInterruption->description_en        = $holiday['name'];
                    $newInterruption->interruption_type_id  = $holiday['interruption_type_id'];//InterruptionType::where('name_pt', InterruptionTypesEnum::HOLIDAYS)->first()->id;
                    $newInterruption->calendar_id           = $newCalendar->id;
                    $newInterruption->save();
                }
            }
        }

        return response()->json("Created", Response::HTTP_CREATED);
    }

    public function getAvailableMethods(Request $request, Calendar $calendar) {
        $availableMethods = DB::table("calendars")
            ->join("epochs", function($join){
                $join->on("calendars.id", "epochs.calendar_id");
            })
            ->join("epoch_method", function($join){
                $join->on("epochs.id", "epoch_method.epoch_id");
            })
            ->join("methods", function($join){
                $join->on("epoch_method.method_id", "methods.id");
            })
            ->join("course_unit_method", function($join){
                $join->on("methods.id", "course_unit_method.method_id");
            })
            ->join("course_units", function($join){
                $join->on("course_unit_method.course_unit_id", "course_units.id");
            })
            ->where("calendars.id", $calendar->id)
            ->where("epoch_id", $request->epoch_id)
            ->where("curricular_year", $request->year)
            ->where('course_units.course_id', $calendar->course_id)
            ->whereNotExists(function ($query) use($request) {
                $query->from("exams")->whereRaw("exams.method_id = methods.id")->where("exams.epoch_id", $request->epoch_id);
            });

            if (Auth::user()->groups()->isTeacher()->exists()
                && (
                    Auth::user()->groups()->coordinator()->exists() && Auth::user()->groups()->board()->exists()
                    && Auth::user()->groups()->superAdmin()->exists() && Auth::user()->groups()->admin()->exists()
                    && Auth::user()->groups()->pedagogic()->exists() && Auth::user()->groups()->responsiblePedagogic()->exists()
                    && Auth::user()->groups()->gop()->exists()
                )
            ) {
                $availableMethods->whereIn('course_units.id', Auth::user()->courseUnits->pluck('id'));
            }

            if (Auth::user()->groups()->responsible()->get()->count() > 0) {
                $availableMethods->whereIn('course_units.id', CourseUnit::where('responsible_user_id', Auth::user()->id)->get()->pluck('id'));
            }

            $eachCourseUnit = $availableMethods->select("course_units.*")->distinct()->get();
            $response = collect();

            foreach ($eachCourseUnit as $courseUnit) {
                $response->push($courseUnit);
            }


            $availableMethods = $availableMethods->join("evaluation_types", function($join){
                $join->on("evaluation_types.id", "methods.evaluation_type_id");
            });

            foreach ($response->toArray() as $courseUnit) {
                $available = clone $availableMethods;
                $courseUnit->methods = $available
                    ->where('course_units.id', $courseUnit->id)
                    ->select(["methods.*", "evaluation_types.description"])->get()->toArray();

            }

            return AvailableCourseUnitsResource::collection($response);
    }

    public function show(Calendar $calendar)
    {
        return new CalendarResource($calendar->load(['epochs', 'interruptions']));
    }

    public function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        $calendar->fill($request->all())->save();

        CalendarChanged::dispatch($calendar);
    }

    public function destroy(Calendar $calendar)
    {
        $calendar->delete();
        CalendarDeleted::dispatch($calendar);
    }

    public function publish(PublishCalendarRequest $request, Calendar $calendar)
    {
        Calendar::where('id', '!=', $calendar->id)
            ->where('course_id', $calendar->course_id)
            ->where('semester', $calendar->semester)
            ->delete();
        if ($request->exists('createCopy') && $request->createCopy) {
            $clone = $calendar->replicate();
            $clone->previous_calendar_id = $calendar->id;
            $clone->push();
            $calendar->load(['epochs.methods.courseUnits', 'epochs.exams']);

            foreach ($calendar->interruptions as $interruption) {
                $clone->interruptions()->create($interruption->toArray());
            }

            foreach ($calendar->epochs as $epoch) {
                $newEpoch = $clone->epochs()->create($epoch->toArray());

                foreach ($epoch->exams as $exam) {
                    $copyOfExam = $exam->replicate();
                    $copyOfExam->epoch_id = $newEpoch->id;
                    $copyOfExam->save();
                }

                foreach ($epoch->methods as $method) {
                    $method->epochs()->attach($newEpoch);

                }

            }
            $clone->published = false;
            $clone->calendar_phase_id = 1;
            $clone->save();
        }
        if (!$calendar->published) {
            $calendar->calendar_phase_id = CalendarPhase::where('code', "published")->first()->id;
            $calendar->published = true;
            $calendar->save();
            CalendarPublished::dispatch($calendar);
        }
    }

    public function listSemesters(Request $request)
    {
        if($request->has('special')){
            return SemestersSearchResource::collection(Semester::all());
        }
        return SemestersSearchResource::collection(Semester::where("special", 0)->get());
    }

    public function calendarSemesters()
    {
        return Calendar_SemesterResource::collection(Semester::all());
    }

    public function calendarInterruptions(Request $request)
    {
        $yearOfFirstDay = $request->input("first_year");
        $yearOfLastDay = $request->input("last_year");
        $holidays = [];
        $interruptionTypeId = InterruptionType::where('name_pt', InterruptionTypesEnum::HOLIDAYS)->first()->id;
        do {
            $holidayList = ExternalImports::getYearHolidays($yearOfFirstDay);
            foreach ($holidayList->Holiday as $key => $holiday) {
                $holidays[] = [
                    "date"                  => $holiday->Date->__toString(),
                    "name"                  => $holiday->Name->__toString(),
                    "type_name"             => $holiday->Type->__toString(),
                    "interruption_type_id"  => $interruptionTypeId,
                ];
            }
        } while ($yearOfFirstDay++ < $yearOfLastDay);
        //dd($holidays);
        return response()->json($holidays, Response::HTTP_OK);
    }
}
