<?php

namespace App\Http\Controllers\API;

use App\Filters\CourseUnitFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseUnitRequest;
use App\Http\Resources\Admin\Edit\CourseUnitEditResource;
use App\Http\Resources\Admin\LogsResource;
use App\Http\Resources\Generic\BranchSearchResource;
use App\Http\Resources\Generic\CourseUnitListResource;
use App\Http\Resources\Generic\CourseUnitSearchResource;
use App\Http\Resources\Generic\EpochMethodResource;
use App\Http\Resources\Generic\TeacherResource;
use App\Http\Resources\MethodResource;
use App\Models\Calendar;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use App\Models\EpochType;
use App\Models\Group;
use App\Models\Method;
use App\Models\Semester;
use App\Models\UnitLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourseUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, CourseUnitFilters $filters)
    {
        $lang = (in_array($request->header("lang"), ["en", "pt"]) ? $request->header("lang") : "pt");
        $perPage = request('per_page', 20);

        $courseUnits = CourseUnit::with('methods')->filter($filters, $lang)->ofAcademicYear($request->cookie('academic_year'));

        if ($request->has('all') && $request->all === "true") {
            $courseUnits = $courseUnits->orderBy('name_' . $lang)->get();
        } else {
            $userId = Auth::user()->id;
            $userGroups = Auth::user()->groups();
            if (
                Auth::user()->groups()->superAdmin()->get()->count() == 0 &&
                Auth::user()->groups()->admin()->get()->count() == 0 &&
                Auth::user()->groups()->responsiblePedagogic()->get()->count() == 0
            ) {
                if (with(clone $userGroups)->responsible()->get()->count() > 0 && $userGroups->count() == 1) {
                    $courseUnits->where('responsible_user_id', $userId);
                }
                if (with(clone $userGroups)->coordinator()->get()->count() > 0) {
                    $courseUnits->whereIn('course_id', Course::where('coordinator_user_id', $userId)->pluck('id'));
                    if (with(clone $userGroups)->isTeacher()->get()->count() > 0) {
                        $courseUnits->orWhereIn('id', Auth::user()->courseUnits->pluck('id'));
                    }
                }

                if (with(clone $userGroups)->isTeacher()->get()->count() > 0) {
                    $courseUnits->whereIn('id', Auth::user()->courseUnits->pluck('id'));
                }

                $schoolsForTheUser = collect();

                if (Auth::user()->gopSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->gopSchools->pluck('id'));
                }
                if (Auth::user()->boardSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->boardSchools->pluck('id'));
                }
                if (Auth::user()->pedagogicSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->pedagogicSchools->pluck('id'));
                }

                if ($schoolsForTheUser->count() > 0) {
                    $courseUnits->whereIn('course_id', Course::whereIn('school_id', $schoolsForTheUser->toArray())->get()->pluck('id'));
                }
            }
            if( request('semester') ){
                $courseUnits->where('semester_id', Semester::where('number', request('semester'))->first()->id);
            }
            $courseUnits = $courseUnits->orderBy('name_' . $lang)->paginate($perPage);
        }
        return CourseUnitListResource::collection($courseUnits);
    }

    public function search(Request $request, CourseUnitFilters $filters)
    {
        $lang = (in_array($request->header("lang"), ["en", "pt"]) ? $request->header("lang") : "pt");

        $courseUnits = CourseUnit::filter($filters)->ofAcademicYear($request->cookie('academic_year'));

        if ($request->has('all') && $request->all === "true") {
            $courseUnits = $courseUnits->orderBy('name_' . $lang)->get();
        } else {
            $userId = Auth::user()->id;
            $userGroups = Auth::user()->groups();
            if (
                Auth::user()->groups()->superAdmin()->exists() &&
                Auth::user()->groups()->admin()->exists() &&
                Auth::user()->groups()->responsiblePedagogic()->exists()
            ) {
                if (with(clone $userGroups)->responsible()->exists() && $userGroups->count() == 1) {
                    $courseUnits->where('responsible_user_id', $userId);
                }
                if (with(clone $userGroups)->coordinator()->exists()) {
                    $courseUnits->whereIn('course_id', Course::where('coordinator_user_id', $userId)->pluck('id'));
                    if (with(clone $userGroups)->isTeacher()->get()->count() > 0) {
                        $courseUnits->orWhereIn('id', Auth::user()->courseUnits->pluck('id'));
                    }
                }

                if (with(clone $userGroups)->isTeacher()->exists()) {
                    $courseUnits->whereIn('id', Auth::user()->courseUnits->pluck('id'));
                }

                $schoolsForTheUser = collect();

                if (Auth::user()->gopSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->gopSchools->pluck('id'));
                }
                if (Auth::user()->boardSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->boardSchools->pluck('id'));
                }
                if (Auth::user()->pedagogicSchools->pluck('id')->count() > 0) {
                    $schoolsForTheUser->push(Auth::user()->pedagogicSchools->pluck('id'));
                }

                if ($schoolsForTheUser->count() > 0) {
                    $courseUnits->whereIn('course_id', Course::whereIn('school_id', $schoolsForTheUser->toArray())->get()->pluck('id'));
                }
            }
            $courseUnits = $courseUnits->orderBy('name_' . $lang)->limit(30)->get();
        }
        return CourseUnitSearchResource::collection($courseUnits);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CourseUnitRequest $request)
    {
        $newCourseUnit = new CourseUnit($request->all());
        $newCourseUnit->save();
        UnitLog::create([
            "course_unit_id"    => $newCourseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Unidade curricular criada por '" . Auth::user()->name . "'."
        ]);

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseUnit $courseUnit)
    {
        return new CourseUnitEditResource($courseUnit->load(['methods', 'responsibleUser']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CourseUnitRequest $request, CourseUnit $courseUnit)
    {
        $courseUnit->fill($request->all());
        $courseUnit->save();
        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Unidade curricular atualizada por '" . Auth::user()->name . "'."
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, CourseUnit $courseUnit)
    {
        $courseUnit->academicYears()->detach($request->cookie('academic_year'));
    }

    /******************************************
     *             RELATIONS CALLS
     *  - Branches
     *  - Teachers
     *  - Methods
     *  - Logs
     ******************************************/

    /**
     * List branches for the COURSE of the unit
     */
    public function branches(CourseUnit $courseUnit)
    {
        return  BranchSearchResource::collection($courseUnit->course->branches);
    }

    /**
     * List teachers associated to the unit
     */
    public function teachers(CourseUnit $courseUnit)
    {
        $teachers = $courseUnit->teachers;
        $responsible_id = $courseUnit->responsible_user_id;
        foreach ($teachers as $teacher){
            $teacher['isResponsible'] = $teacher->id == $responsible_id;
        }
        return  TeacherResource::collection($teachers);
    }


    public function addTeacher(Request $request, CourseUnit $courseUnit)
    {
        $teacherUser = User::where('email', $request->teacher)->first();

        if (is_null($teacherUser)) {
            $ldap = new LdapController();
            $ldapResults = $ldap->getUserInfoByEmail($request->teacher);
            if( empty($ldapResults) ) {
                return response()->json("user not found locally or in the LDAP tables", Response::HTTP_BAD_REQUEST);
            }
            $newUser = new User([
                "email" => $ldapResults['email'],
                "name" => $ldapResults['name'],
                "password" => ""
            ]);
            $newUser->save();
        }

        $user = is_null($teacherUser) ? $newUser : $teacherUser;

        if (!$user->groups()->isTeacher()->exists()) {
            $user->groups()->syncWithoutDetaching(Group::isTeacher()->get());
        }

        $teachersForCourseUnit[] = $user->id;

        $courseUnit->teachers()->syncWithoutDetaching($teachersForCourseUnit);
        $courseUnit->save();
        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Professor '$user->email' adicionado nesta Unidade curricular por '" . Auth::user()->name . "'."
        ]);
        return response()->json("user added", Response::HTTP_OK);
    }

    public function removeTeacher(CourseUnit $courseUnit, int $teacher)
    {
        $teacherUser = User::find($teacher);
        if (is_null($teacherUser)) {
            return response()->json("user not found locally", Response::HTTP_BAD_REQUEST);
        }
        $courseUnit->teachers()->detach($teacherUser->id);
        $courseUnit->save();

        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Professor '$teacherUser->email' removido nesta Unidade curricular por '" . Auth::user()->name . "'."
        ]);
        return response()->json("user removed", Response::HTTP_OK);
    }

    /**
     * List methods associated to the unit
     */
    public function methodsForCourseUnit(CourseUnit $courseUnit, Request $request)
    {
        $epochTypesList = EpochType::all();
        $list = EpochMethodResource::collection($epochTypesList);
        $yearId = $request->cookie('academic_year');
        $courseUnitId = $courseUnit->id;
        $newCollection = collect($list);

        $finalList = $newCollection->map(function ($item, $key) use ($yearId, $courseUnitId){
            $methods = Method::ofAcademicYear($yearId)
                            ->join('epoch_type_method', 'epoch_type_method.method_id', '=', 'methods.id')
                                ->where('epoch_type_method.epoch_type_id', $item['id'])
                            ->join('course_unit_method', 'course_unit_method.method_id', '=', 'methods.id')
                                ->where('course_unit_method.course_unit_id', $courseUnitId)
                            ->get();
            //byCourseUnit($courseUnit->id)->byEpochType($epochType->id)->ofAcademicYear($yearId)->get();

            $item['methods'] = MethodResource::collection($methods);
            return $item;
        });

        return $finalList->all();
    }

    public function epochsForCourseUnit(CourseUnit $courseUnit)
    {
        $availableCalendarsForCourseUnit = Calendar::where('course_id', $courseUnit->course_id)->whereIn('semester_id', [$courseUnit->semester_id, 3])->get()->pluck('id');
        $epochs = Epoch::whereIn('calendar_id', $availableCalendarsForCourseUnit)->groupBy(['epoch_type_id', 'name'])->get(['epoch_type_id', 'name']);

        return response()->json($epochs);
    }


    public function assignResponsible(Request $request, CourseUnit $courseUnit)
    {
        $user = User::find($request->responsible_teacher);
        if ($user->groups()->responsible()->count() == 0) {
            $user->groups()->syncWithoutDetaching(Group::responsible()->get());
        }
        $courseUnit->responsibleUser()->associate($user);
        $courseUnit->save();

        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Professor responsavel por esta Unidade curricular alterado para '$user->email' por '" . Auth::user()->name . "'."
        ]);
    }


    /**
     * List logs associated to the unit
     */
    public function logs(CourseUnit $courseUnit)
    {
        return  LogsResource::collection($courseUnit->log);
    }
}
