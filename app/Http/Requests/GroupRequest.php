<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class GroupRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            "name" => "required|string",
            "description_pt" => "required|string",
            "description_en" => "required|string",
            "enabled" => "boolean"
        ];
    }
}
