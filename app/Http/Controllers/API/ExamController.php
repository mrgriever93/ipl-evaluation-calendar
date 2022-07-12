<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewExamRequest;
use App\Http\Resources\API_V1\Calendars\ExamCalendarResource;
use App\Http\Resources\ExamResource;
use App\Models\Calendar;
use App\Models\CourseUnit;
use App\Models\CourseUnitGroup;
use App\Models\Epoch;
use App\Models\Exam;
use App\Models\Method;
use Illuminate\Http\Response;

class ExamController extends Controller
{
    public function index()
    {
        //
    }

    public function show(Exam $exam)
    {
        return new ExamResource($exam::with(['courseUnit', 'comments'])->find($exam->id));
    }

    public function store(NewExamRequest $request)
    {
        $calendarId = $request->calendar_id;
        $epochId = $request->epoch_id;

        $validation = $this->checkIfCanEditExam($calendarId, $epochId, $request->course_id, $request->method_id, $request->course_unit_id);
        if($validation){
            return $validation;
        }

        $courseUnitGroup = CourseUnit::find($request->course_unit_id)->group;
        $courseUnitGroup = $courseUnitGroup ? $courseUnitGroup->id : null;
        if ($courseUnitGroup) {
            foreach (CourseUnitGroup::find($courseUnitGroup)->courseUnits as $courseUnit) {
                foreach (Method::find($request->method_id)->epochType as $epochType) {
                    $epoch = Epoch::where('epoch_type_id', $epochType->id)->where('calendar_id', $calendarId)->first();
                    $hasEpoch = $epoch->calendar()->where('calendars.is_published', false)->exists();
                    $hasExams = Exam::where('method_id', $request->method_id)->where('epoch_id', $epoch->id)->count();
                    if ($hasEpoch && $hasExams === 0) {
                        $newExam = new Exam($request->all());
                        /*$newExam->fill([
                            "course_id" => $courseUnit->course_id,
                            "epoch_id" => $epoch->id,
                            "course_unit_id" => $courseUnit->id
                        ]);*/
                        $newExam->save();
                    }
                }
            }
        } else {
            $newExam = new Exam($request->all());
            $newExam->save();
        }
        return response()->json(new ExamCalendarResource($newExam), Response::HTTP_CREATED);
    }

    public function update(NewExamRequest $request, Exam $exam)
    {
        /*
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
            $courseUnits = $exam->method->courseUnits;
            foreach ($courseUnits as $courseUnit) {
                $epochId = Epoch::where('epoch_type_id', $exam->epoch->epoch_type_id)
                   ->where('calendar_id', Calendar::where('course_id', $courseUnit->course_id)->where('is_published', false)->latest('id')->first()->id)
                   ->first()->id;
               $examToUpdate = $courseUnit->exams->where('epoch_id', $epochId)->last();

               if (($allHaveSameGroup && $courseUnit->group !== null) || $examToUpdate->id === $exam->id) {
                   $examToUpdate->room = $request->room;
                   $examToUpdate->date_start = $request->date_start;
                   $examToUpdate->date_end = $request->date_end;
                   $examToUpdate->hour = $request->hour;
                   $examToUpdate->duration_minutes = $request->duration_minutes;
                   $examToUpdate->observations_pt = $request->observations_pt;
                   $examToUpdate->observations_en = $request->observations_en;

                   $examToUpdate->save();
               }
            }
        */

        $validation = $this->checkIfCanEditExam($request->calendar_id, $request->epoch_id, $request->course_id, $request->method_id, $request->course_unit_id, $exam->id);
        if($validation){
            return $validation;
        }
        // check if CUs of exam belongs to any group
        $belongsToGroup = $exam->courseUnit->group;
        if($belongsToGroup) {

        } else {
            //$exam->calendar_id     = $request->calendar_id;
            //$exam->course_id       = $request->course_id;
            $exam->epoch_id        = $request->epoch_id;
            $exam->method_id       = $request->method_id;

            $exam->room         = $request->room;
            $exam->group_id     = $request->group_id;
            $exam->date_start   = $request->date_start;
            $exam->date_end     = $request->date_end;
            $exam->hour         = $request->hour;
            $exam->in_class     = $request->in_class;
            $exam->duration_minutes = $request->duration_minutes;
            $exam->observations_pt = $request->observations_pt;
            $exam->observations_en = $request->observations_en;
            $exam->save();
        }
        return response()->json(new ExamCalendarResource($exam), Response::HTTP_OK);
    }

    public function checkIfCanEditExam($calendarId, $epochId, $course_id, $method_id, $course_unit_id, $examId = null){

        // TODO
        /**
         * DO NOT ALLOW BOOK EXAM WHEN (COMMULATIVE):
         * - Day is the same
         * - Year of the CourseUnit is the same (1st, 2nd or 3rd)
         * - Branch ("Ramo") is the same
         */

        $epochRecord = Epoch::find($epochId);
        if ( $epochRecord->calendar->is_published ) {
            return response()->json("Not allowed to book exams on Published Calendars!", Response::HTTP_FORBIDDEN);
        }
        // $checkExam = Exam::where('epoch_id', '=', $epochId)->where('epoch_id', '=', $epochId)->where('method_id', '=', $method_id);
        // if($examId){
        //     $checkExam->where('id', '<>', $examId);
        // }
        // if ( $checkExam->exists() ) {
        //     return response()->json("Not allowed to insert the same exam on this calendar!", Response::HTTP_UNPROCESSABLE_ENTITY);
        // }

        if ( $epochRecord->calendar->id !== $calendarId ) {
            return response()->json("The epoch id is not correct for the given calendar.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ( Calendar::find($calendarId)->course->id !== $course_id ) {
            return response()->json("The course id is not correct for the given calendar.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $courseUnitMethods = CourseUnit::find($course_unit_id);
        // TODO rever erro aqui nos epochs
        $epochTypeId = $epochRecord->epoch_type_id;
        if ($courseUnitMethods->methods()->whereHas('epochType', function ($query) use ($epochTypeId) {
                return $query->where('epoch_type_id', $epochTypeId);
            })->sum('weight') < 100) {
            return response()->json("Not allowed to create this exam until you have all the methods completed!", Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        return false;
    }

    public function destroyByDate(Calendar $calendar, $date)
    {
        if($calendar->is_published){
            return response()->json("Not allowed to delete exams on Published Calendars!", Response::HTTP_FORBIDDEN);
        }
        $exams = $calendar->exams()->where(function ($query) use($date) {
                $query->whereDate('date_start', '>=', $date)
                    ->whereDate('date_end', '<=', $date);
                })->orWhere(function ($query) use($date) {
                $query->whereDate('date_start', '<=', $date)
                    ->whereDate('date_end', '>=', $date);
                })->get();
        foreach ($exams as $exam) {
            $this->destroy($exam);
        }
        return response()->json("Removed!");
    }

    public function destroy(Exam $exam)
    {
        if($exam->epoch->calendar->is_published){
            return response()->json("Not allowed to delete exams on Published Calendars!", Response::HTTP_FORBIDDEN);
        }
        $belongsToGroup = $exam->courseUnit->group;
        if($belongsToGroup) {
            foreach ($exam->method->courseUnits as $courseUnit) {
                $epochId = Epoch::where('epoch_type_id', $exam->epoch->epoch_type_id)
                    ->where('calendar_id', Calendar::where('course_id', $courseUnit->course_id)->where('is_published', false)->latest('id')->first()->id)
                    ->first()->id;
                $examToDelete = $courseUnit->exams->where('epoch_id', $epochId)->last();

                if ($courseUnit->group !== null || $examToDelete->id === $exam->id) {
                    $examToDelete->delete();
                    $examToDelete->epoch->calendar()->touch();
                }
            }
        } else {
            $exam->delete();
        }
        return response()->json("Removed!");
    }
}
