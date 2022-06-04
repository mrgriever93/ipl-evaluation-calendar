<?php

namespace App\Http\Controllers;

use App\Filters\CourseUnitGroupFilters;
use App\Http\Requests\CourseUnitGroupRequest;
use App\Http\Resources\Admin\CourseUnitGroupListResource;
use App\Http\Resources\Admin\Edit\CourseUnitGroupResource;
use App\Models\Calendar;
use App\Models\CourseUnit;
use App\Models\CourseUnitGroup;
use App\Models\Epoch;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CourseUnitGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, CourseUnitGroupFilters $filters)
    {
        $list = CourseUnitGroup::with('courseUnits')->filter($filters)->ofAcademicYear($request->cookie('academic_year'))->resolve();
        return CourseUnitGroupListResource::collection($list);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CourseUnitGroupRequest $request)
    {
        $existingMethodsForCourseUnits = 0;
        $existingMethods = null;
        foreach ($request->get('course_units') as $courseUnit) {
            $courseUnitEntity = CourseUnit::find($courseUnit);

            if (count($courseUnitEntity->methods) > 0) {
                $existingMethods = $courseUnitEntity->methods()->pluck('id');
                $existingMethodsForCourseUnits++;
            }
        }

        if ($existingMethodsForCourseUnits <= 1) {
            $newCourseUnitGroup = new CourseUnitGroup();
            $newCourseUnitGroup->description_pt = $request->get('description_pt');
            $newCourseUnitGroup->description_en = $request->get('description_en');
            $newCourseUnitGroup->save();

            foreach ($request->get('course_units') as $courseUnit) {
                $courseUnitEntity = CourseUnit::find($courseUnit);

                $courseUnitEntity->methods()->syncWithoutDetaching($existingMethods);

                foreach ($courseUnitEntity->methods as $method) {
                    $existingEpochToCopy = $method->epochs()->first();
                    $existingEpochToSync =
                        Epoch::where('epoch_type_id', $existingEpochToCopy->epoch_type_id)
                        ->whereIn('calendar_id', Calendar::where('course_id', $courseUnitEntity->course_id)->get()->pluck('id'))
                        ->get();
                    if (!is_null($existingEpochToSync)) {
                        $method->epochs()->syncWithoutDetaching($existingEpochToSync->pluck('id'));
                    }

                }

            }

            CourseUnit::where('course_unit_group_id', null)->whereIn('id', $request->get('course_units'))->update(['course_unit_group_id' => $newCourseUnitGroup->id]);

            return response()->json("Created!", Response::HTTP_CREATED);
        }

        return response()->json("Existing methods for more than 1 course unit in the group!", Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(CourseUnitGroupRequest $request, CourseUnitGroup $courseUnitGroup)
    {
        $courseUnitGroup->description = $request->get('description');
        $courseUnitGroup->save();
        CourseUnit::whereIn('id', $request->get('course_units'))->update(['course_unit_group_id' => $courseUnitGroup->id]);
        CourseUnit::whereNotIn('id', $request->get('course_units'))->where('course_unit_group_id', $courseUnitGroup->id)->update(['course_unit_group_id' => null]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(CourseUnitGroup $courseUnitGroup)
    {
        return new CourseUnitGroupResource($courseUnitGroup->load('courseUnits'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(CourseUnitGroup $courseUnitGroup)
    {
        $courseUnitGroup->delete();
    }
}
