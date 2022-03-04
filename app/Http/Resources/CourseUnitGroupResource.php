<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitGroupResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'  => $this->id,
            'description' => $this->description,
            'course_units' => CourseUnitResource::collection($this->whenLoaded('courseUnits')),
            'num_course_units' => count($this->courseUnits),
        ];
    }
}
