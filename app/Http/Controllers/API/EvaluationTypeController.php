<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationTypeRequest;
use App\Http\Resources\Admin\Edit\EvaluationTypeDetailResource;
use App\Http\Resources\Admin\EvaluationTypeResource;
use App\Models\EvaluationType;
use Illuminate\Http\Response;

class EvaluationTypeController extends Controller
{
    public function index()
    {
        return EvaluationTypeResource::collection(EvaluationType::all());
    }

    public function store(EvaluationTypeRequest $request)
    {
        $newEvaluationType = new EvaluationType($request->all());
        $newEvaluationType->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    public function show($id)
    {
        return new EvaluationTypeDetailResource(EvaluationType::findOrFail($id));
    }

    public function update(EvaluationTypeRequest $request, EvaluationType $evaluationType)
    {
        $evaluationType->fill($request->all())->save();

        return response()->json("Updated!", Response::HTTP_OK);
    }

    public function destroy(EvaluationType $evaluationType)
    {
        $evaluationType->delete();
    }
}
