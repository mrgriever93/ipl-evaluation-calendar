<?php

namespace App\Http\Resources\Admin\Edit;

use App\Http\Resources\MethodResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitEditResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'code'              => $this->code,
            'name_pt'           => $this->name_pt,
            'name_en'           => $this->name_en,
            'initials'          => $this->initials,
            'curricularYear'    => $this->curricular_year,
            'semester'          => $this->semester,

            'course'            => $this->course_id,
            'branch'            => $this->branch_id,
            "responsible"       => $this->responsible_user_id,
            "course_unit_group" => $this->course_unit_group_id,

            "teachers"  => UserResource::collection($this->teachers),
            "methods"   => MethodResource::collection($this->whenLoaded('methods'))
        ];
    }
}
