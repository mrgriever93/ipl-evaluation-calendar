<?php

namespace App\Http\Resources;

use App\Models\CourseUnit;
use Illuminate\Http\Resources\Json\JsonResource;

class AvailableCourseUnitsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'initials' => $this->initials,
            'branch' => CourseUnit::find($this->id)->branch,
            'methods' => AvailableMethodsResource::collection($this->methods)
        ];
    }
}
