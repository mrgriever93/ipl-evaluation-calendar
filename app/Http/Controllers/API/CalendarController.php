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
use App\Http\Resources\Generic\CalendarDetailResource;
use App\Http\Resources\Generic\CalendarInfoResource;
use App\Http\Resources\Generic\CalendarListResource;
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
use App\Models\Method;
use App\Models\Semester;
use App\Services\ExternalImports;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class CalendarController extends Controller
{

    public function index(Request $request, CalendarFilters $filters)
    {
        $lang = (in_array($request->header("lang"), ["en", "pt"]) ? $request->header("lang") : "pt");
        $perPage = request('per_page', 20);

        $calendars = Calendar::filter($filters)->ofAcademicYear($request->cookie('academic_year'));
        return CalendarListResource::collection($calendars->orderBy('previous_calendar_id')->paginate($perPage));
    }

    public function store(NewCalendarRequest $request)
    {
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
            $newCalendar->calendar_phase_id = CalendarPhase::where('code', 'edit_gop')->firstOrFail()->id;
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

    public function show(Calendar $calendar)
    {
        return new CalendarDetailResource($calendar->load(['epochs', 'interruptions']));
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


    public function info(Request $request)
    {
        $has_courses = Course::ofAcademicYear($request->cookie('academic_year'))->count() > 0;
        $academic_year = $request->cookie('academic_year');
        $semesters = Semester::whereHas('calendar', function (Builder $query) use($academic_year) {
            $query->ofAcademicYear($academic_year);
        })->get();

        $response = [
            'filters' => [
                'has_courses'   => $has_courses,
                'semesters'     => SemestersSearchResource::collection($semesters),
            ]
        ];

        return response()->json($response);
    }

    public function getAvailableMethods(Request $request, Calendar $calendar) {

        $epoch_type_id = Epoch::find($request->epoch_id)->epoch_type_id;
        $availableMethods = CourseUnit::where("curricular_year", $request->year)
            ->where('semester_id', $calendar->semester_id)
            ->where('course_id', $calendar->course_id);

        //return AvailableCourseUnitsResource::collection($availableMethods);
        $includedCUs = [];
        if (Auth::user()->groups()->isTeacher()->exists()
            && (
                Auth::user()->groups()->coordinator()->exists() && Auth::user()->groups()->board()->exists()
                && Auth::user()->groups()->superAdmin()->exists() && Auth::user()->groups()->admin()->exists()
                && Auth::user()->groups()->pedagogic()->exists() && Auth::user()->groups()->responsiblePedagogic()->exists()
                && Auth::user()->groups()->gop()->exists()
            )
        ) {
            // where Teachers have those CUs [CourseUnit.id in (....)]
            $includedCUs = Auth::user()->courseUnits->pluck('id');
        }

        if (Auth::user()->groups()->responsible()->exists()) {
            // include CUs that the user is responsible for
            array_push($includedCUs, CourseUnit::where('responsible_user_id', Auth::user()->id)->get()->pluck('id'));
        }
        if(!empty($includedCUs)) {
            $availableMethods->whereIn('course_units.id', $includedCUs);
        }
        $eachCourseUnit = $availableMethods->distinct()->get();
        $response = collect();

        foreach ($eachCourseUnit as $courseUnit) {
            $response->push($courseUnit);
        }

        //$availableMethods = $availableMethods->join("evaluation_types", function($join){
        //    $join->on("evaluation_types.id", "methods.evaluation_type_id");
        //});

        foreach($response->toArray() as $key => $courseUnit) {
            //dd($response[$key]->methods);
            $response[$key]->methods = Method::whereHas('epochType', function (Builder $query) use($epoch_type_id) {
                $query->where('epoch_type_id', $epoch_type_id);
            })->whereRelation('courseUnits', 'course_unit_id', $courseUnit['id'])
                ->with('evaluationType')
                ->get()->toArray();

            $is_complete = !Method::whereHas('epochType', function (Builder $query) use($epoch_type_id) {
                $query->where('epoch_type_id', $epoch_type_id);
            })->whereRelation('courseUnits', 'course_unit_id', $courseUnit['id'])
                ->doesntHave('exams')
                ->exists();//get()->toArray();
            //dd($is_complete);
            $response[$key]->is_complete = $is_complete;
        }
        return AvailableCourseUnitsResource::collection($response);
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
        return response()->json($holidays, Response::HTTP_OK);
    }
}
