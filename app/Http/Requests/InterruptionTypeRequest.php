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
        return [
            "name"          => "required|string",
            "description"   => "required|string",
            "enabled"       => "sometimes|boolean"
        ];
    }
}
