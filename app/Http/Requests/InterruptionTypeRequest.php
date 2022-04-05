<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class InterruptionTypeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules =  [
            'code'      => 'string|max:120',
            'name_pt'   => 'string|max:255',
            'name_en'   => 'string|max:255',
            'enabled'   => 'required|boolean',
        ];

        return $rules;
    }
}
