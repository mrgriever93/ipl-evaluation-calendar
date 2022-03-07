<?php

namespace App\Http\Controllers\API;

use App\Models\EvaluationType;
use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationTypeRequest;
use App\Http\Requests\NewEvaluationTypeRequest;
use App\Http\Resources\EvaluationTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EvaluationTypeController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(EvaluationTypeRequest $request)
    {
        $newEvaluationType = new EvaluationType($request->all());
        $newEvaluationType->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display all resources.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function list()
    {
        return EvaluationTypeResource::collection(EvaluationType::all());
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return new EvaluationTypeResource(EvaluationType::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(EvaluationTypeRequest $request, EvaluationType $evaluationType)
    {
        $evaluationType->fill($request->all())->save();

        return response()->json("Updated!", Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  EvaluationType  $evaluationType
     * @return \Illuminate\Http\Response
     */
    public function destroy(EvaluationType $evaluationType)
    {
        $evaluationType->delete();
    }
}
