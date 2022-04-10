<?php

namespace App\Http\Controllers;

use App\Filters\CourseFilters;
use App\Http\Requests\CourseRequest;
use App\Http\Resources\Generic\CourseListResource;
use App\Http\Resources\Generic\CourseResource;
use App\Models\AcademicYear;
use App\Models\Branch;
use App\Models\Course;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, CourseFilters $filters)
    {
        $perPage = request('per_page', 10);
        $courseList = Course::with('school')->ofAcademicYear($request->cookie('academic_year'));
        if( request('school') ){
            $courseList->where('school_id', request('semester'));
        }
        if( request('degree') ){
            $courseList->where('degree', request('degree'));
        }
        $courseList->filter($filters);

        return CourseListResource::collection($courseList->paginate($perPage));
    }

    public function removeStudent(Course $course, User $student) {
        $student->courses()->detach($course->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     */
    public function show(Course $course)
    {
        return new CourseResource($course);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     */
    public function update(CourseRequest $request, Course $course)
    {
        $course->fill($request->all());

        if ($request->has('coordinator_user_id')) {
            $this->assignCoordinatorUserToCourse($request->coordinator_user_id, $course);
        }

        $this->createOrUpdateBranches($request->branches, $course);

        $course->save();
    }

    public function assignCoordinator (Request $request, Course $course) {
        $coordinatorUser = User::where('email', $request->coordinator_user_email)->first();

        if (is_null($coordinatorUser)) {
            $newUser = new User([
                "email" => $request->coordinator_user_email,
                "name" => $request->coordinator_user_name,
                "password" => ""
            ]);
            $newUser->save();
            $this->assignCoordinatorUserToCourse($newUser->id, $course);
        }

        $course->coordinator_user_id = is_null($coordinatorUser) ? $newUser->id : $coordinatorUser->id;
        $course->save();
    }

    public function addStudent(Request $request, Course $course) {
        $student = User::where('email', $request->user_email)->first();

        if (is_null($student)) {
            $student = User::create([
                "email" => $request->user_email,
                "name" => $request->user_name,
                "password" => "",
            ]);
        }

        if ($student->groups()->isStudent()->get()->count() == 0) {
            $student->groups()->syncWithoutDetaching(Group::isStudent()->get());
        }

        $student->courses()->syncWithoutDetaching($course->id);
    }

    private function assignCoordinatorUserToCourse($user, $course)
    {
        if (isset($user)) {
            $coordinatorUser = User::find($user);
            $hasCoordinatorGroup = $coordinatorUser->groups()->coordinator()->count() > 0;
            if (!$hasCoordinatorGroup) {
                $coordinatorUser->groups()->syncWithoutDetaching(Group::coordinator()->get());
            }
            $course->coordinatorUser()->associate($coordinatorUser);
        } else {
            $course->coordinatorUser()->associate(null);
        }
    }

    private function createOrUpdateBranches($branches, $course)
    {
        if (isset($branches)) {

            foreach ($branches as $branch) {
                if (isset($branch->id)) {
                    $existingBranch = Branch::find($branch->id);
                    $existingBranch->update($branch);
                    $existingBranch->course()->associate($course);
                } else {
                    $newBranch = new Branch($branch);
                    $newBranch->course()->associate($course);
                    $newBranch->save();
                }
            }
        }
    }

    public function deleteBranch(Branch $branch) {
        $branch->delete();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, Course $course)
    {
        if ($request->hasCookie('academic_year')) {
            $academicYear = AcademicYear::findOrFail($request->cookie('academic_year'));

            $calendarsOfCourse = Course::ofAcademicYear($academicYear->id)->where('id', $course->id)->first()->calendars()->delete();
            /*foreach ($calendarsOfCourse as $calendar) {
                $calendar->delete();
            }*/

            $course->academicYears()->detach($academicYear->id);
            $count = Course::whereHas('academicYears', function (Builder $query) use($course) {
                $query->where('course_id', $course->id);
            })->count();

            if ($count == 0) {
                $course->delete();
            }
        } else {
            return response()->json("The academic year is not being passed!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
