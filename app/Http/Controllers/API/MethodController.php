<?php

namespace App\Http\Controllers\API;

use App\Models\Calendar;
use App\Models\CourseUnit;
use App\Models\CourseUnitGroup;
use App\Models\Epoch;
use App\Models\Method;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewMethodRequest;
use App\Http\Requests\UpdateMethodRequest;
use App\Http\Resources\MethodResource;
use App\Models\UnitLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class MethodController extends Controller
{

    public function index()
    {
        return MethodResource::collection(Method::all());
    }

    public function store(NewMethodRequest $request)
    {

        // TODO
        /*
         * Get course_unit semester
         *      > add special semesters
         * Get each epoch_Types (this already include all "seasons"
         *      Add each epoch_type by course_unit by academic_year
         */
        // search course unit
        $courseUnit = CourseUnit::find($request->methods[0]['course_unit_id']);

        foreach ($request->methods as $method) {
            $newMethod = new Method($method);
            $newMethod->academic_year_id = $request->cookie('academic_year');
            if (array_key_exists('id', $method)) {
                $newMethod = Method::find($method['id']);
                $newMethod->fill($method);
            }

            $newMethod->save();

            if ($courseUnit->course_unit_group_id) {
                // if this course unit has a group ("agrupamento"), then
                // navigate through all the unit courses in that group and
                // insert the new method
                $groupCourseUnits = CourseUnitGroup::find($courseUnit->course_unit_group_id)->courseUnits()->get();
                foreach ($groupCourseUnits as $groupCourseUnit) {
                    $newMethod->epochType()->syncWithoutDetaching($method['epoch_type_id']);
                    $newMethod->courseUnits()->syncWithoutDetaching($groupCourseUnit);
                    $newMethod->save();
                }
            } else {
                $newMethod->epochType()->syncWithoutDetaching($method['epoch_type_id']);
                $newMethod->courseUnits()->syncWithoutDetaching($courseUnit);
                $newMethod->save();
            }
        }

        foreach ($request->removed as $removedMethod) {
            $this->destroy(Method::find($removedMethod));
        }

        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Metodos de avaliacao alterados por '" . Auth::user()->name . "'."
        ]);

        return response()->json("Created/Updated!", Response::HTTP_OK);
    }


    public function show(Method $method)
    {
        return new MethodResource($method);
    }

    public function update(UpdateMethodRequest $request, Method $method)
    {
        $method->update($request->all());
    }

    public function destroy(Method $method)
    {
        if (count($method->exams) > 0) {
            return response()->json("Existing exams for this method. Not allowed!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $method->delete();
    }
}
