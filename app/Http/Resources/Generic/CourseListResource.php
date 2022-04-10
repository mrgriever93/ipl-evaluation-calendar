<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseListResource extends JsonResource
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
            'name' => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'duration' => $this->num_years,
            'level' => $this->getLevel($this->degree),
            'school' => $this->whenLoaded('school')->code
        ];
    }
}
