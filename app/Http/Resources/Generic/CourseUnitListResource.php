<?php

namespace App\Http\Resources\Generic;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                    => $this->id,
            'name'                  => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'course_description'    => "{$this->course->name} ({$this->course->code})",
            'initials'              => $this->initials,
            'code'                  => $this->code,
            'curricularYear'        => $this->curricular_year,
            'semester'              => $this->semester,
            //'branch_label'        => ($request->header("lang") == "en" ? $this->branch()->first()->name_en : $this->branch()->first()->name_pt),
            'branch_label'          => ($request->header("lang") == "en" ? $this->branch->name_en : $this->branch->name_pt),
        ];
    }
}
