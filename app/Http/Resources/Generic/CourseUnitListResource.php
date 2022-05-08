<?php

namespace App\Http\Resources\Generic;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitListResource extends JsonResource
{
    public function toArray($request)
    {
        $lang_header = $request->header("lang");
        return [
            'id'                    => $this->id,
            'name'                  => ($lang_header == "en" ? $this->name_en : $this->name_pt),
            'course_description'    => ($lang_header == "en" ? $this->course->name_en : $this->course->name_pt) ." ({$this->course->code})",
            'initials'              => $this->initials,
            'code'                  => $this->code,
            'curricularYear'        => $this->curricular_year,
            'semester'              => $this->semester->number,
            //'branch_label'        => ($lang_header == "en" ? $this->branch()->first()->name_en : $this->branch()->first()->name_pt),
            'branch_label'          => ($lang_header == "en" ? $this->branch->name_en : $this->branch->name_pt),
            'has_methods'           => $this->methods()->exists()
        ];
    }
}
