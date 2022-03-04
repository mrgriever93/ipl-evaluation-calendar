<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NewCalendarRequest extends FormRequest
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

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'import_holidays'                       => 'boolean',
            'semester'                              => 'required|integer|min:1|max:3',
            'observations'                          => 'nullable|string|max:255',
            'is_all_courses'                        => 'required|boolean',
            'epochs'                                => 'required',
            'epochs.*.type'                         => 'required|integer|exists:epoch_types,id',
            'epochs.*.name'                         => 'required|string',
            'epochs.*.start_date'                   => 'required|date_format:Y-m-d|before:epochs.*.end_date',
            'epochs.*.end_date'                     => 'required|date_format:Y-m-d|after:epochs.*.start_date',
            'interruptions.*.start_date'            => 'required|date_format:Y-m-d|before_or_equal:interruptions.*.end_date',
            'interruptions.*.end_date'              => 'required|date_format:Y-m-d|after_or_equal:interruptions.*.start_date',
            'interruptions.*.description'           => 'nullable',
            'interruptions.*.interruption_type_id'  => 'required|exists:interruption_types,id',
            'interruptions.*.enabled'               => 'boolean',
            'courses'                               => ['exists:courses,id,deleted_at,NULL', Rule::requiredIf(function () {
                return !$this->is_all_courses;
            })]
        ];
    }
}
