<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseUnitGroupRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            "description" => "required|string",
            "course_units" => "required|array",
            "course_units.*" => "required|integer|exists:course_units,id"
        ];
    }
}
