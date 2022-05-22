<?php

namespace App\Http\Controllers\API;

use App\Models\Calendar;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\CourseUnitGroup;
use App\Models\Epoch;
use App\Models\Exam;
use App\Models\Method;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewExamRequest;
use App\Http\Resources\ExamResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExamController extends Controller
{
    public function index()
    {
        //
    }

    public function store(NewExamRequest $request)
    {
        $epoch = $request->epoch_id;

        if (Epoch::find($epoch)->calendar->published) {
            return response()->json("Not allowed to book exams on Published Calendars!", Response::HTTP_FORBIDDEN);
        }

        if (
            Exam::where('epoch_id', '=', $epoch)
            ->where('method_id', '=', $request->method_id)
            ->count() > 0
        ) {
            return response()->json("Not allowed to insert the same exam on this calendar!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Epoch::find($epoch)->calendar->id !== $request->calendar_id) {
            return response()->json("The epoch id is not correct for the given calendar.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Calendar::find($request->calendar_id)->course->id !== $request->course_id) {
            return response()->json("The course id is not correct for the given calendar.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $courseUnitMethods = CourseUnit::find($request->course_unit_id);
        // TODO rever erro aqui nos epochs
        if ($courseUnitMethods->methods()->whereHas('epochs', function ($query) use ($epoch) {
            return $query->where('epoch_id', '=', $epoch);
        })->sum('weight') < 100) {
            return response()->json("Not allowed to create this exam until you have all the methods completed!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        dd($courseUnitMethods);

        // TODO
        /**
         * DO NOT ALLOW BOOK EXAM WHEN (COMMULATIVE):
         * - Day is the same
         * - Year of the CourseUnit is the same (1st, 2nd or 3rd)
         * - Branch ("Ramo") is the same
         */


        $courseUnitGroup = CourseUnit::find($request->course_unit_id)->group;
        $courseUnitGroup = $courseUnitGroup ? $courseUnitGroup->id : null;
        if ($courseUnitGroup) {
            foreach (CourseUnitGroup::find($courseUnitGroup)->courseUnits as $courseUnit) {
                foreach (Method::find($request->method_id)->epochs as $epoch) {
                    if (
                        Epoch::
                            find($epoch->id)
                            ->calendar()
                            ->where('calendars.published', false)
                            ->count() > 0
                            &&
                            Exam::where('method_id', $request->method_id)->where('epoch_id', $epoch->id)->count() === 0
                        ) {
                        $newExam = new Exam($request->all());
                        $newExam->fill([
                            "course_id" => $courseUnit->course_id,
                            "epoch_id" => $epoch->id,
                            "course_unit_id" => $courseUnit->id
                        ]);
                        $newExam->save();
                    }
                }
            }
        } else {
            $newExam = new Exam($request->all());
            $newExam->save();
        }



        return response()->json("Created", Response::HTTP_CREATED);
    }

    public function show(Exam $exam)
    {
        return new ExamResource($exam::with('courseUnit')->find($exam->id));
    }

    public function update(NewExamRequest $request, Exam $exam)
    {
        $allHaveSameGroup = null;
        $aux = null;
        $courseUnits = $exam->method->courseUnits;
        foreach ($courseUnits as $courseUnit) {
            if (is_null($aux)) {
                $aux = $courseUnit->group;
            }
            $allHaveSameGroup = !is_null($courseUnit->group) ? $courseUnit->group->id == $aux->id : false;

            if (!$allHaveSameGroup) {
                break;
            }
        }

        foreach ($courseUnits as $courseUnit) {
            $epochId = Epoch::
                where('epoch_type_id', $exam->epoch->epoch_type_id)
                ->where('calendar_id', Calendar::where('course_id', $courseUnit->course_id)->where('published', false)->latest('id')->first()->id)
                ->first()->id;
            $examToUpdate = $courseUnit->exams->where('epoch_id', $epochId)->last();

            if (($allHaveSameGroup && $courseUnit->group !== null) || $examToUpdate->id === $exam->id) {
                $examToUpdate->room = $request->room;
                $examToUpdate->date = $request->date;
                $examToUpdate->hour = $request->hour;
                $examToUpdate->duration_minutes = $request->duration_minutes;
                $examToUpdate->observations = $request->observations;

                $examToUpdate->save();
            }
        }
    }

    public function destroy(Exam $exam)
    {
        foreach ($exam->method->courseUnits as $courseUnit) {
            $epochId = Epoch::
                where('epoch_type_id', $exam->epoch->epoch_type_id)
                ->where('calendar_id', Calendar::where('course_id', $courseUnit->course_id)->where('published', false)->latest('id')->first()->id)
                ->first()->id;
            $examToDelete = $courseUnit->exams->where('epoch_id', $epochId)->last();

            if ($courseUnit->group !== null || $examToDelete->id === $exam->id) {
                $examToDelete->delete();
                $examToDelete->epoch->calendar()->touch();
            }
        }

        return response()->json("Removed!");
    }
}
