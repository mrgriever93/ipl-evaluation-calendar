<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;

class NewExamRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(Request $request)
    {
        $newExamRules = $request->isMethod('POST') ? 
            [
                "method_id" => "required|exists:methods,id",
                "epoch_id" => "required|exists:epochs,id,deleted_at,NULL",
                "course_unit_id" => "required|exists:course_units,id"
            ] : [];

        return array_merge($newExamRules, [
                "room" => "string",
                "date" => "required|date_format:Y-m-d",
                "hour" => "required|date_format:H:i",
                "duration_minutes" => "integer|numeric",
                "observations" => "nullable|string",
                "calendar_id" => "required|exists:calendars,id,deleted_at,NULL",
                "course_id" => "required|exists:courses,id,deleted_at,NULL"
            ]);
            
    }
}