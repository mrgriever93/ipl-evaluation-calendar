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
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MethodController extends Controller
{

    public function index()
    {
        return MethodResource::collection(Method::all());
    }

    public function store(NewMethodRequest $request)
    {
        foreach ($request->methods as $method) {
            $courseUnit = CourseUnit::find($method['course_unit_id']);
            $newMethod = new Method($method);
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
                foreach ($groupCourseUnits as $courseUnit) {

                    $epochs = Epoch
                                ::where('epoch_type_id', $method['epoch_type_id'])
                                ->whereIn('calendar_id',
                                    Calendar::where('course_id', $courseUnit->course_id)->whereIn('semester', [$courseUnit->semester, 3])->get('id')
                                )
                                ->get()->pluck('id');
                    $newMethod->epochs()->syncWithoutDetaching($epochs);
                    $newMethod->courseUnits()->syncWithoutDetaching($courseUnit);
                    $newMethod->save();
                }
            } else {
                $newMethod->courseUnits()->syncWithoutDetaching($courseUnit);
                $newMethod->save();

                $epochs = Epoch
                        ::where('epoch_type_id', $method['epoch_type_id'])
                        ->whereIn('calendar_id',
                            Calendar::where('course_id', $courseUnit->course_id)->whereIn('semester', [$courseUnit->semester, 3])->get('id')
                        )
                        ->get()->pluck('id');
                $newMethod->epochs()->syncWithoutDetaching($epochs);
                $newMethod->save();
            }
        }

        foreach ($request->removed as $removedMethod) {
            Method::find($removedMethod)->delete();
        }

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
