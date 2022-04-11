<?php

namespace App\Http\Controllers\API;

use App\Filters\CourseUnitFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseUnitRequest;
use App\Http\Resources\Generic\CourseUnitResource;
use App\Models\Calendar;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CourseUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, CourseUnitFilters $filters)
    {
        $perPage = request('per_page', 10);
        $courseUnits = CourseUnit::with('methods')->filter($filters)->ofAcademicYear($request->cookie('academic_year'));
        if ($request->has('all') && $request->all === "true") {
            $courseUnits = $courseUnits->orderBy('name')->get();
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
                $courseUnits->where('semester', request('semester'));
            }
            $courseUnits = $courseUnits->orderBy('name')->paginate($perPage);
        }
        return CourseUnitResource::collection($courseUnits);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(CourseUnitRequest $request)
    {
        if (!empty($request->responsible_user_id)) {
            $this->attachResponsibleGroupToUser($request->responsible_user_id);
        }

        $newCourseUnit = new CourseUnit($request->all());
        $newCourseUnit->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }


    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show(CourseUnit $courseUnit)
    {
        return new CourseUnitResource($courseUnit->load(['methods', 'responsibleUser']));
    }

    public function branches(CourseUnit $courseUnit)
    {
        return response()->json($courseUnit->course->branches);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param CourseUnit $courseUnit
     * @return \Illuminate\Http\Response
     */
    public function update(CourseUnitRequest $request, CourseUnit $courseUnit)
    {
        if (!empty($request->responsible_user_id)) {
            $this->attachResponsibleGroupToUser($request->responsible_user_id);
        }
        $courseUnit->fill($request->all());
        $teachersForCourseUnit = [];
        foreach ($request->teachers as $teacher) {
            $teacherUser = User::where('email', $teacher['email'])->first();

            if (is_null($teacherUser)) {
                $newUser = new User([
                    "email" => $teacher['email'],
                    "name" => $teacher['name'],
                    "password" => ""
                ]);
                $newUser->save();
            }

            $user = is_null($teacherUser) ? $newUser : $teacherUser;

            if (!$user->groups()->isTeacher()->get()->count() > 0) {
                $user->groups()->syncWithoutDetaching(Group::isTeacher()->get());
            }

            $teachersForCourseUnit[] = $user->id;
        }
        $courseUnit->teachers()->sync($teachersForCourseUnit, true);
        $courseUnit->save();
    }

    public function epochsForCourseUnit(CourseUnit $courseUnit)
    {
        $availableCalendarsForCourseUnit = Calendar::where('course_id', $courseUnit->course_id)->whereIn('semester', [$courseUnit->semester, 3])->get()->pluck('id');
        $epochs = Epoch::whereIn('calendar_id', $availableCalendarsForCourseUnit)->groupBy(['epoch_type_id', 'name'])->get(['epoch_type_id', 'name']);

        return response()->json([
            "courseUnit" => $courseUnit->name,
            "courseUnitGroup" => $courseUnit->group ? $courseUnit->group->description : null,
            "epochs" => $epochs
        ]);
    }

    public function methodsForCourseUnit(CourseUnit $courseUnit)
    {
        foreach ($courseUnit->methods as $method) {
            $epochs = $method->epochs();
            $method['epoch_type_id'] = $epochs->count() > 0 ? $epochs->first()->epoch_type_id : null;
        }

        return response()->json($courseUnit->methods);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, CourseUnit $courseUnit)
    {
        $courseUnit->academicYears()->detach($request->cookie('academic_year'));
    }


    private function attachResponsibleGroupToUser($responsible_user_id)
    {
        $user = User::find($responsible_user_id);
        if ($user->groups()->responsible()->get()->count() == 0) {
            $user->groups()->syncWithoutDetaching(Group::responsible()->get());
        }
    }

    private function assignResponsibleUserToCourseUnit($user, $courseUnit)
    {
        if (isset($user)) {
            $responsibleUser = User::find($user);
            $hasCoordinatorGroup = $responsibleUser->groups()->responsible()->count() > 0;
            if (!$hasCoordinatorGroup) {
                $responsibleUser->groups()->syncWithoutDetaching(Group::responsible()->get());
            }
            $courseUnit->responsibleUser()->associate($responsibleUser);
        } else {
            $courseUnit->responsibleUser()->associate(null);
        }
    }

    public function assignResponsible(Request $request, CourseUnit $courseUnit)
    {
        $responsibleUser = User::where('email', $request->responsible_user_email)->first();

        if (is_null($responsibleUser)) {
            $newUser = new User([
                "email" => $request->responsible_user_email,
                "name" => $request->responsible_user_name,
                "password" => ""
            ]);
            $newUser->save();

            $this->attachResponsibleGroupToUser($newUser->id);
        }

        $this->assignResponsibleUserToCourseUnit(is_null($responsibleUser) ? $newUser->id : $responsibleUser->id, $courseUnit);
        $courseUnit->save();
    }
}
