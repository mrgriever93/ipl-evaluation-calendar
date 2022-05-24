<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\MethodResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitExamResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                    => $this->id,
            'code'                  => $this->code,
            'curricular_year'       => $this->curricular_year,
            'name'                  => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'initials'              => $this->initials,
            'semester'              => $this->semester->number,

            'course'        => [
                "id"            => $this->course_id,
                'name'          => "(" . $this->course->code . ") " . ($request->header("lang") == "en" ? $this->course->name_en : $this->course->name_pt),
            ],
            'responsible'   => [
                'id'            => $this->whenLoaded('responsibleUser', $this->responsible_user_id),
                "name"          => $this->whenLoaded('responsibleUser', is_null($this->responsibleUser) ? null :  $this->responsibleUser->name),
                'email'         => $this->whenLoaded('responsibleUser', is_null($this->responsibleUser) ? null :  $this->responsibleUser->email),
            ],
            'branch'        => [
                "id"            => $this->branch_id,
                "name"          => ($request->header("lang") == "en" ? $this->branch->name_en : $this->branch->name_pt),
                "initials"      => ($request->header("lang") == "en" ? $this->branch->initials_en : $this->branch->initials_pt),
            ],
        ];
    }
}

