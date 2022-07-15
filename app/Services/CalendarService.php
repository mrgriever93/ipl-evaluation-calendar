<?php
/**
 * Created by PhpStorm.
 * Project: calendar-v2
 * User: Miguel Cerejo
 * Date: 7/4/2022
 * Time: 1:19 AM
 *
 * File: CalendarService.php
 */

namespace App\Services;

use App\Events\CalendarChanged;
use App\Events\CalendarPublished;
use App\Http\Requests\NewCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Http\Resources\Admin\CalendarPhaseResource;
use App\Http\Resources\AvailableCourseUnitsResource;
use App\Http\Resources\Generic\GroupsPhaseResource;
use App\Http\Resources\Generic\SemestersSearchResource;
use App\Http\Resources\WarningCalendarResource;
use App\Models\Calendar;
use App\Models\CalendarPhase;
use App\Models\CalendarViewers;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use App\Models\EpochType;
use App\Models\Group;
use App\Models\Interruption;
use App\Models\InterruptionType;
use App\Models\InterruptionTypesEnum;
use App\Models\Method;
use App\Models\Permission;
use App\Models\Semester;
use App\Utils\Utils;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarService
{
    public static function store(NewCalendarRequest $request)
    {
        $courses = $request->courses;
        if ($request->is_all_courses) {
            $courses = Course::all();
        }

        foreach ($courses as $key => $course) {
            $newCalendar = new Calendar($request->all());
            $newCalendar->version = 0.0;
            // To make sure that the calendar starts with the right flags
            $newCalendar->is_temporary = 0;
            $newCalendar->is_published = 0;

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
            // TODO make the create of calendar more dynamic with DB records
            CalendarViewers::insert([
                ["calendar_id" => $newCalendar->id, "group_id" => 1],   // "super_admin"
                ["calendar_id" => $newCalendar->id, "group_id" => 2],   // "admin"
                ["calendar_id" => $newCalendar->id, "group_id" => 8],   // "gop"
                ["calendar_id" => $newCalendar->id, "group_id" => 13]   // "gop_estg"
            ]);
        }

        return "Created";
    }

    public static function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        $calendar->fill($request->all())->save();

        // delete old viewers
        CalendarViewers::where("calendar_id", $calendar->id)->delete();

        $groups = $request->input("groups");
        $viewers = [];
        foreach ($groups as $group) {
            $viewers[] = ["group_id" => $group, "calendar_id" => $calendar->id];
        }
        // insert all new viewers groups
        CalendarViewers::insert($viewers);

        // TODO check user for this action
        if($calendar->calendar_phase_id == CalendarPhase::phasePublished()) {
            if(Auth::user()->groups()->Gop()){
                $calendar->is_temporary = false;
                $calendar->is_published = true;
                $calendar->save();
            } else if(Auth::user()->groups()->Coordinator()){
                $calendar->is_temporary = true;
                $calendar->is_published = false;
                $calendar->save();
            }
            CalendarPublished::dispatch($calendar);
        } else {
            CalendarChanged::dispatch($calendar);
        }
    }

    public static function publish(Calendar $calendar)
    {
        Calendar::where('id', '!=', $calendar->id)
            ->where('course_id', $calendar->course_id)
            ->where('semester_id', $calendar->semester_id)
            ->delete();

        if (!$calendar->is_published) {
            $calendar->calendar_phase_id = CalendarPhase::phasePublished();
            if(Auth::user()->groups()->Coordinator()) {
                // add 0.1 to version because is a coordinator
                $calendar->version = floatval($calendar->version) + 0.1;
                $calendar->is_temporary = true;
                $calendar->is_published = false;
            } else if(Auth::user()->groups()->Gop()){
                // add 1.0 to version because is the gop
                $calendar->version = intval($calendar->version) + 1;
                $calendar->is_temporary = false;
                $calendar->is_published = true;
            }
            $calendar->save();

            // delete old viewers
            CalendarViewers::where("calendar_id", $calendar->id)->delete();

            $groups = Group::where('enabled', true)->pluck('id')->toArray();
            $viewers = [];
            foreach ($groups as $group) {
                $viewers[] = ["group_id" => $group, "calendar_id" => $calendar->id];
            }
            // insert all new viewers groups
            CalendarViewers::insert($viewers);

            // if coordinator, copy the calendar to work on
            if(Auth::user()->groups()->Coordinator()){
                self::copyCalendar($calendar);
            }
            CalendarPublished::dispatch($calendar);
        }
    }

    public static function copyCalendar(Calendar $calendar)
    {
        Calendar::where('id', '!=', $calendar->id)
            ->where('course_id', $calendar->course_id)
            ->where('semester_id', $calendar->semester_id)
            ->delete();

        // clone new calendar
        $clone = $calendar->replicate();
        $clone->previous_calendar_id = $calendar->id;
        // validate if we want to add 0.1 or 1.0
        //$clone->version = floatval(intval(explode('.', $calendar->version)[0])  . "." .intval(explode('.', $calendar->version)[1]) + 1);
        // make sure the flags are correct
        $clone->is_published = false;
        $clone->is_temporary = false;
        // set the correct phase, having in account the user that created the copy
        if(Auth::user()->groups()->gop()){
            $clone->calendar_phase_id = CalendarPhase::phaseEditGop();
        } else if(Auth::user()->groups()->coordinator()){
            $clone->calendar_phase_id = CalendarPhase::phaseEditCC();
        }
        $clone->push();
        //$calendar->load(['epochs.epochType.methods', 'epochs.exams']);

        // clone the interruptions
        foreach ($calendar->interruptions as $interruption) {
            $clone->interruptions()->create($interruption->toArray());
        }

        // clone the epochs
        // TODO miguel.cerejo
        foreach ($calendar->epochs as $epoch) {
            $newEpoch = $clone->epochs()->create($epoch->toArray());
            // clone the exams
            foreach ($epoch->exams as $exam) {
                $copyOfExam = $exam->replicate();
                $copyOfExam->epoch_id = $newEpoch->id;
                $copyOfExam->save();
            }
            // clone the commentaries?
            // -----
        }

        $clone->save();
        // TODO add to the right user
        CalendarViewers::insert([
            ["calendar_id" => $clone->id, "group_id" => 1],   // "super_admin"
            ["calendar_id" => $clone->id, "group_id" => 2],   // "admin"
            ["calendar_id" => $clone->id, "group_id" => 8],   // "gop"
            ["calendar_id" => $clone->id, "group_id" => 13]   // "gop_estg"
        ]);
    }

    public static function info(Request $request)
    {
        $utils = new Utils();
        $has_academic_year = $utils->getCurrentAcademicYear($request) != 0;
        if($has_academic_year) {
            $has_courses = Course::ofAcademicYear($request->cookie('academic_year'))->count() > 0;
            $academic_year = $request->cookie('academic_year');
            $semesters = Semester::whereHas('calendar', function (Builder $query) use ($academic_year) {
                $query->ofAcademicYear($academic_year);
            })->get();
        } else {
            $has_courses = false;
            $semesters = [];
        }
        $response = [
            'filters' => [
                'has_courses'   => $has_courses,
                'semesters'     => SemestersSearchResource::collection($semesters),
            ],
            'has_academic_year' => $has_academic_year
        ];

        return $response;
    }

    public static function getAvailableMethods(Request $request, Calendar $calendar) {

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

    public static function calendarInterruptions(Request $request)
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
        return $holidays;
    }

    public static function getCalendarWarnings(Calendar $calendar) {

        $epoch_types = Epoch::where("calendar_id", $calendar->id)->pluck("epoch_type_id")->toArray();
        //dd($epoch_types);
        $availableMethods = CourseUnit::where('semester_id', $calendar->semester_id)
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
            $isComplete = true;
            $epochMethods = [];
            foreach($epoch_types as $epoch) {
                $method = Method::whereHas('epochType', function (Builder $query) use ($epoch) {
                    $query->where('epoch_type_id', $epoch);
                })->whereRelation('courseUnits', 'course_unit_id', $courseUnit['id'])
                    ->with('evaluationType')
                    ->with('epochType')
                    ->get()->toArray();

                if(!empty($method)){
                    $epochMethods = array_merge($epochMethods, $method);
                }
                $is_complete = Method::whereHas('epochType', function (Builder $query) use ($epoch) {
                    $query->where('epoch_type_id', $epoch);
                })->whereRelation('courseUnits', 'course_unit_id', $courseUnit['id'])
                    ->doesntHave('exams')
                    ->exists();
                // if any epoch is not complete, it will stay false
                if($is_complete){
                    $isComplete = false;
                }
            }
            $response[$key]->methods = collect($epochMethods);
            if( $response[$key]->id == 570 ){
                //dd($response[$key]->methods);
            }
            $response[$key]->is_complete = $isComplete;
        }

        return WarningCalendarResource::collection($response);
    }

    public static function phases(Request $request)
    {
        //$groupsQuery = Group::all();

        /*
         *
            SELECT `groups`.`name_pt`,
                    EXISTS (
                        Select *
                        From  `group_permissions`
                        where
                            `group_permissions`.`group_id`  = `groups`.`id` and
                            `group_permissions`.`permission_id` = (select permissions.id from permissions where permissions.code = "view_calendar") and
                            `group_permissions`.`phase_id` = 9
                    ) as `has_permission`
            FROM `groups`;
         * */
        $permissionId = Permission::permissionViewCalendar();
        $phaseId = $request->get("phase-id", 9);

        $groupsQuery = Group::withExists([
            'permissions as has_permission' => function ($query) use($permissionId, $phaseId) {
                return $query->where('permission_id', $permissionId)->where('phase_id', $phaseId);
            }
        ])->get();

        $response = [
            "phases" => CalendarPhaseResource::collection(CalendarPhase::all()),
            "groups" => GroupsPhaseResource::collection($groupsQuery)
        ];
        return $response;
    }

    public static function phasesGroups(Request $request)
    {
        $permissionId = Permission::permissionViewCalendar();
        $phaseId = $request->get("phase-id", 9);

        $groupsQuery = Group::withExists([
            'permissions as has_permission' => function ($query) use($permissionId, $phaseId) {
                return $query->where('permission_id', $permissionId)->where('phase_id', $phaseId);
            }
        ])->get();
        return GroupsPhaseResource::collection($groupsQuery);
    }
}
