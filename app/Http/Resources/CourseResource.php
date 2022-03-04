<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    private function getLevel($levelNumber)
    {
        switch ($levelNumber) {
            case "5":
                return "TeSP";
            case "6":
                return "Licenciatura";
            case "7":
                return "Mestrado";
            case "8":
                return "Doutoramento";
        }
    }

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'initials' => $this->initials,
            'display_name' => $this->name . " (" . $this->code . ")",
            'name' => $this->name,
            'duration' => $this->num_years,
            'level' => $this->getLevel($this->degree),
            'school' => $this->whenLoaded('school'),
            'coordinator' => $this->coordinatorUser,
            'branches' => $this->branches,
            'course_units' => CourseUnitResource::collection($this->courseUnits),
            'students' => UserResource::collection($this->students) 
        ];
    }
}
