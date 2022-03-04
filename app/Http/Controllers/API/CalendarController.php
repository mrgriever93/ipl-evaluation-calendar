<?php

namespace App\Http\Controllers\API;

use App\Calendar;
use App\CalendarPhase;
use App\Course;
use App\CourseUnit;
use App\Http\Controllers\Controller;
use App\Epoch;
use App\Events\CalendarChanged;
use App\Events\CalendarDeleted;
use App\Events\CalendarPublished;
use App\Exam;
use App\Filters\CalendarFilters;
use App\Http\Requests\NewCalendarRequest;
use App\Http\Requests\PublishCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Http\Resources\AvailableCourseUnitsResource;
use App\Http\Resources\AvailableMethodsResource;
use App\Http\Resources\CalendarResource;
use App\Http\Resources\CourseUnitResource;
use App\Http\Resources\SemesterResource;
use App\InitialGroups;
use App\Interruption;
use App\InterruptionType;
use App\Method;
use App\Semester;
use Carbon\Carbon;
use Dotenv\Util\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str as SupportStr;
use PhpParser\ErrorHandler\Collecting;

class CalendarController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, CalendarFilters $filters)
    {
        $calendars = Calendar::with(['course', 'phase'])->filter($filters);
        return CalendarResource::collection($calendars->ofAcademicYear($request->cookie('academic_year'))->orderBy('previous_calendar_id')->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(NewCalendarRequest $request)
    {
        $courses = $request->courses;
        if ($request->is_all_courses) {
            $courses = Course::all();
        }

        foreach ($courses as $key => $course) {
            $newCalendar = new Calendar($request->all());
            $newCalendar->academic_year_id = $request->cookie('academic_year');
            $newCalendar->course_id = $course["id"] ?? $course;
            $newCalendar->calendar_phase_id = CalendarPhase::first('id')->id;
            $newCalendar->save();

            foreach ($request->epochs as $key => $epoch) {
                $newEpoch = new Epoch($epoch);
                $newEpoch->epoch_type_id = $epoch['type'];
                $newCalendar->epochs()->save($newEpoch);

                foreach (CourseUnit::where('course_id', $newCalendar->course_id)->get() as $courseUnit) {
                    foreach ($courseUnit->methods as $method) {
                        $existingEpochToCopy = $method->epochs()->first();
                        $isSameEpochType = !is_null($existingEpochToCopy) ? $existingEpochToCopy->epoch_type_id == $newEpoch->epoch_type_id : false;
                        if ($isSameEpochType) {
                            $method->epochs()->syncWithoutDetaching($newEpoch);
                        }
                    }
                }
                
            }

            foreach ($request->interruptions as $key => $interruption) {
                $newInterruption = new Interruption($interruption);
                $newInterruption->calendar_id = $newCalendar->id;
                if (empty($interruption->description)) {
                    $newInterruption->description = InterruptionType::find($interruption['interruption_type_id'])->description;
                }
                $newInterruption->save();
            }

            if ($request->import_holidays) {
                $yearOfFirstDay = Carbon::parse($newCalendar->firstDayOfSchool())->year;
                $yearOfLastDay = Carbon::parse($newCalendar->lastDayOfSchool())->year;
                do {
                    Interruption::importYearHolidays($yearOfFirstDay, $newCalendar->id);
                } while ($yearOfFirstDay++ < $yearOfLastDay);
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

            if (Auth::user()->groups()->isTeacher()->get()->count() > 0 
                && (
                    Auth::user()->groups()->coordinator()->get()->count() == 0
                    && Auth::user()->groups()->board()->get()->count() == 0
                    && Auth::user()->groups()->superAdmin()->get()->count() == 0
                    && Auth::user()->groups()->admin()->get()->count() == 0
                    && Auth::user()->groups()->pedagogic()->get()->count() == 0
                    && Auth::user()->groups()->responsiblePedagogic()->get()->count() == 0
                    && Auth::user()->groups()->gop()->get()->count() == 0
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

    /**
     * Display the specified resource.
     *
     * @param  Calendar  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Calendar $calendar)
    {
        return new CalendarResource($calendar->load(['epochs', 'interruptions']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        $calendar->fill($request->all())->save();

        CalendarChanged::dispatch($calendar);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Calendar  $id
     * @return \Illuminate\Http\Response
     */
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
            $calendar->calendar_phase_id = CalendarPhase::where('name', "Published")->first()->id;
            $calendar->published = true;
            $calendar->save();
            CalendarPublished::dispatch($calendar);
        }
    }

    public function listSemesters()
    {
        return SemesterResource::collection(Semester::all());
    }
}
