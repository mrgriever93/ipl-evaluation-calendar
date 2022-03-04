<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class SchoolRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'code' => 'required|string',
            'name' => 'required|string',
            'gop_group_id' => 'nullable|sometimes|exists:groups,id',
            'board_group_id' => 'nullable|sometimes|exists:groups,id',
            'pedagogic_group_id' => 'nullable|sometimes|exists:groups,id',
            'base_link' => 'sometimes|string',
            'index_course_code' => 'sometimes|string',
            'index_course_name' => 'sometimes|string',
            'index_course_unit_name' => 'sometimes|string',
            'index_course_unit_curricular_year' => 'sometimes|string',
            'index_course_unit_code' => 'sometimes|string',
            'index_course_unit_teachers' => 'sometimes|string',
            'query_param_academic_year' => 'sometimes|string',
            'query_param_semester' => 'sometimes|string',
        ];
        return $rules;
    }
}
