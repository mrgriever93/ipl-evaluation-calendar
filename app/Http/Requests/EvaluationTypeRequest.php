<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EvaluationTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules =  [
            'code'         => 'string|max:120',
            'description'  => 'string|max:255',
            'enabled'      => 'required|boolean',
        ];

        return $rules;
    }
}
