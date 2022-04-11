<?php

namespace App\Http\Resources\Generic;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'initials' => $this->initials,
            'code' => $this->code,
            'curricularYear' => $this->curricular_year,
            'semester' => $this->semester,
            'branch' => $this->branch,
        ];
    }
}
