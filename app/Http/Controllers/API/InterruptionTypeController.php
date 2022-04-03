<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\InterruptionTypeRequest;
use App\Http\Resources\Admin\InterruptionTypeResource;
use App\Models\InterruptionType;
use Illuminate\Http\Response;

class InterruptionTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return InterruptionTypeResource::collection(InterruptionType::all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(InterruptionTypeRequest $request)
    {
        $newInterruptionType = new InterruptionType($request->all());
        $newInterruptionType->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(InterruptionType $interruptionType)
    {
        return new InterruptionTypeResource($interruptionType);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  InterruptionType  $id
     * @return \Illuminate\Http\Response
     */
    public function update(InterruptionTypeRequest $request, InterruptionType $interruptionType)
    {
        $interruptionType->fill($request->all());
        $interruptionType->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(InterruptionType $interruptionType)
    {
        $interruptionType->delete();
    }
}
