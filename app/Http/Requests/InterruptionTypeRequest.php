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
            'name_pt'   => 'string|max:255|unique:interruption_types,name_pt',
            'name_en'   => 'string|max:255|unique:interruption_types,name_en',
            'enabled'   => 'required|boolean',
        ];

        return $rules;
    }
}
