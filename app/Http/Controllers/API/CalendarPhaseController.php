<?php

namespace App\Http\Controllers\API;

use App\Models\CalendarPhase;
use App\Http\Controllers\Controller;
use App\Http\Requests\CalendarPhaseRequest;
use App\Http\Resources\CalendarPhaseResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CalendarPhaseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return CalendarPhaseResource::collection(CalendarPhase::all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CalendarPhaseRequest $request)
    {
        $newCalendarPhase = new CalendarPhase($request->all());
        $newCalendarPhase->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(CalendarPhase $calendarPhase)
    {
        return new CalendarPhaseResource($calendarPhase);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  CalendarPhase  $id
     * @return \Illuminate\Http\Response
     */
    public function update(CalendarPhaseRequest $request, CalendarPhase $calendarPhase)
    {
        $calendarPhase->fill($request->all())->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(CalendarPhase $calendarPhase)
    {
        $calendarPhase->delete();
    }
}
