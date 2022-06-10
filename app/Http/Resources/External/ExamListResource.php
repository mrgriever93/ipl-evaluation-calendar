<?php

namespace App\Http\Resources\External;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'academic_year'     => $this->whenLoaded('courseUnit', $this->courseUnit->curricular_year),
            'method'            => new MethodResource($this->method),
            'course_unit'       => new CourseUnitExamResource($this->courseUnit),
            'epoch_id'          => $this->epoch_id,
            'method_id'         => $this->method_id,
            'room'              => $this->room,
            'date_start'        => $this->date_start,
            'date_end'          => $this->date_end,
            'in_class'          => $this->in_class,
            'hour'              => $this->hour,
            'duration_minutes'  => $this->duration_minutes,
            'observations_pt'   => $this->observations_pt,
            'observations_en'   => $this->observations_en,
            'description_pt'    => $this->description_pt,
            'description_en'    => $this->description_en,
        ];
    }
}
