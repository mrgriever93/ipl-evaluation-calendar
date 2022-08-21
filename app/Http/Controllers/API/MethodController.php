<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\NewGroupMethodRequest;
use App\Http\Resources\Generic\CourseUnitSearchResource;
use App\Models\CourseUnit;
use App\Models\CourseUnitGroup;
use App\Models\Method;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewMethodRequest;
use App\Http\Requests\UpdateMethodRequest;
use App\Http\Resources\MethodResource;
use App\Models\UnitLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class MethodController extends Controller
{

    public function index()
    {
        return MethodResource::collection(Method::all());
    }

    /*
     * Save only methods for single Course Units
     */
    public function store(NewMethodRequest $request)
    {
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
            $newMethod->epochType()->syncWithoutDetaching($method['epoch_type_id']);
            $newMethod->courseUnits()->syncWithoutDetaching($courseUnit);
            $newMethod->save();
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

    /*
     * Save only methods for grouped Course Units
     */
    public function storeGroups(NewGroupMethodRequest $request)
    {
        // search course unit
        $courseUnitGroup = CourseUnitGroup::find($request->methods[0]['course_unit_group_id']);

        $groupCourseUnits = $courseUnitGroup->courseUnits()->get();

        $academicYear = $request->cookie('academic_year');

        foreach ($request->methods as $method) {
            $newMethod = new Method($method);
            $newMethod->academic_year_id = $academicYear;
            if (array_key_exists('id', $method)) {
                $newMethod = Method::find($method['id']);
                $newMethod->fill($method);
            }
            $newMethod->save();
            foreach ($groupCourseUnits as $groupCourseUnit) {
                $newMethod->epochType()->syncWithoutDetaching($method['epoch_type_id']);
                $newMethod->courseUnits()->syncWithoutDetaching($groupCourseUnit);
                $newMethod->save();
            }
        }

        foreach ($request->removed as $removedMethod) {
            $this->destroy(Method::find($removedMethod));
        }

        UnitLog::create([
            "course_unit_group_id"  => $courseUnitGroup->id,
            "user_id"               => Auth::id(),
            "description"           => "Metodos de avaliacao alterados por '" . Auth::user()->name . "'."
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


    public function methodsToCopy(Request $request){
        $ucs = CourseUnit::has('methods')->ofAcademicYear($request->year)->get();
        return CourseUnitSearchResource::collection($ucs);
    }

    public function methodsClone(Request $request){

        // search course unit
        $copyCourseUnit = CourseUnit::find($request->copy_course_unit_id);
        $courseUnit = CourseUnit::find($request->new_course_unit_id);

        foreach ($copyCourseUnit->methods as $method) {
            $newMethod = $method->replicate()->fill([
                'academic_year_id'  => $request->cookie('academic_year'),
                'created_at'        => null,
                'updated_at'        => null
            ]);
            $newMethod->save();
//dd($method->epochType->first()->id);
            $newMethod->epochType()->syncWithoutDetaching($method->epochType->first()->id);
            $newMethod->courseUnits()->sync($courseUnit);
            $newMethod->save();
        }

        UnitLog::create([
            "course_unit_id"    => $courseUnit->id,
            "user_id"           => Auth::id(),
            "description"       => "Metodos de avaliacao copiados por '" . Auth::user()->name . "' da UC '" . $copyCourseUnit->name_pt . "'."
        ]);

        return response()->json("Created/Updated!", Response::HTTP_OK);
    }

    public function destroy(Method $method)
    {
        if (count($method->exams) > 0) {
            return response()->json("Existing exams for this method. Not allowed!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $method->delete();
    }
}
