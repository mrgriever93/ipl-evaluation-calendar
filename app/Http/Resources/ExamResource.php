<?php

namespace App\Http\Resources;

use App\Http\Resources\Generic\CourseUnitExamResource;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
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
            'hour'              => $this->hour,
            'duration_minutes'  => $this->duration_minutes,
            'observations'      => $this->observations,
            'comments'          => ExamCommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
