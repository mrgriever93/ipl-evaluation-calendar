<?php

namespace App\Http\Controllers;

use App\Calendar;
use App\CourseUnit;
use App\CourseUnitGroup;
use App\Epoch;
use App\Filters\CourseUnitGroupFilters;
use App\Http\Requests\CourseUnitGroupRequest;
use App\Http\Resources\CourseUnitGroupResource;
use App\Http\Resources\CourseUnitResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CourseUnitGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(CourseUnitGroupFilters $filters)
    {
        return CourseUnitGroupResource::collection(CourseUnitGroup::with('courseUnits')->filter($filters)->resolve());
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
            $newCourseUnitGroup->description = $request->get('description');
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




            CourseUnit::
                where('course_unit_group_id', null)
                ->whereIn('id', $request->get('course_units'))
                ->update(['course_unit_group_id' => $newCourseUnitGroup->id]);

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
