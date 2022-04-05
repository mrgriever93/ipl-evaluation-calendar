<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalendarPhaseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'code'      => 'required|string',
            'name_pt'   => 'required|string',
            'name_en'   => 'required|string',
            "enabled"   => "sometimes|boolean"
        ];
    }
}
