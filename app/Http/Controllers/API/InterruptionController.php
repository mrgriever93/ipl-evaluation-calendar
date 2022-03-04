<?php

namespace App\Http\Controllers\API;

use App\Calendar;
use App\Epoch;
use App\Exam;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewInterruptionRequest;
use App\Interruption;
use App\InterruptionType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InterruptionController extends Controller
{

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(NewInterruptionRequest $request)
    {
        $newInterruption = new Interruption($request->all());
        if (empty($request->description)) {
            $newInterruption->description = InterruptionType::find($request->interruption_type_id)->description;
        }
        $newInterruption->save();

        $newInterruption->calendar()->touch();

        $epochsWithExams = Epoch::where('calendar_id', $request->calendar_id)
            ->whereHas('exams')
            ->get();

        foreach ($epochsWithExams as $epoch) {
            foreach ($epoch->exams as $exam) {
                if (
                    Carbon::parse($newInterruption->start_date) == Carbon::parse($exam->date)
                    || Carbon::parse($newInterruption->end_date) == Carbon::parse($exam->date)
                ) {
                    return response()->json("The calendar has already exams on the interval specified for the interruption!", Response::HTTP_CONFLICT);
                }
            }
        }

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    public function update(NewInterruptionRequest $request, Interruption $interruption) {
        $interruption->fill($request->all());
        $interruption->save();
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  Interruption  $interruption
     * @return \Illuminate\Http\Response
     */
    public function destroy(Interruption $interruption)
    {
        $interruption->delete();
        $interruption->calendar()->touch();

        return response()->json("Removed!");
    }
}
