<?php

namespace App\Http\Controllers\API;

use App\Models\Calendar;
use App\Models\CalendarChange;
use App\Http\Controllers\Controller;

class CalendarChangeController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param  Calendar  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Calendar $calendar)
    {
        $changesOfCalendar = CalendarChange::where('calendar_id', $calendar->id)->orderByDesc('created_at')->get();

        return response()->json($changesOfCalendar);
    }
}
