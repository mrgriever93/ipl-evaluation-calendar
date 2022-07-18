<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\Generic\UserWithGroupsResource;
use App\Services\DegreesUtil;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseListResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'initials' => $this->initials,
            'name' => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'duration' => $this->num_years,
            'has_issues' => $this->coordinator_user_id == null,
            'level' => DegreesUtil::getDegreeLabel($this->degree),
            'school' => $this->school->code
        ];
    }
}
