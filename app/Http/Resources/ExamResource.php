<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'academic_year'     => $this->whenLoaded('courseUnit', $this->courseUnit->curricular_year),
            'method'            => new MethodResource($this->method),
            'course_unit'       => new CourseUnitResource($this->courseUnit),
            'epoch_id'          => $this->epoch_id,
            'method_id'         => $this->method_id,
            'room'              => $this->room,
            'date'              => $this->date,
            'hour'              => $this->hour,
            'duration_minutes'  => $this->duration_minutes,
            'observations'      => $this->observations,
            'comments'          => ExamCommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}