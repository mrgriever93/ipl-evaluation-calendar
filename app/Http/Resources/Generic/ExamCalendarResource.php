<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\Generic\CourseUnitResource;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamCalendarResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                    => $this->id,
            'academic_year'         => $this->whenLoaded('courseUnit', $this->courseUnit->curricular_year),
            'course_unit_id'        => $this->whenLoaded('courseUnit', $this->courseUnit->id),
            'course_unit_initials'  => $this->whenLoaded('courseUnit', $this->courseUnit->initials),
            'course_unit'           => $this->whenLoaded('courseUnit', ($request->header("lang") == "en" ? $this->courseUnit->name_en : $this->courseUnit->name_pt)),
            'method_name'           => ($request->header("lang") == "en" ? $this->method->evaluationType->name_en : $this->method->evaluationType->name_pt),
            'epoch_id'              => $this->epoch_id,
            'method_id'             => $this->method_id,
            'room'                  => $this->room,
            'date'                  => $this->date,
            'hour'                  => $this->hour,
            'duration_minutes'      => $this->duration_minutes,
            'observations'          => $this->observations,
            'comments'              => $this->comments->count()
        ];
    }
}
