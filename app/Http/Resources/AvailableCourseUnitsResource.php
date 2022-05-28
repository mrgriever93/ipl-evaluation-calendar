<?php

namespace App\Http\Resources;

use App\Models\CourseUnit;
use Illuminate\Http\Resources\Json\JsonResource;

class AvailableCourseUnitsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'name'          => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'initials'      => $this->initials,
            'methods'       => AvailableMethodsResource::collection($this->methods),
            'is_complete'   => $this->is_complete,
            'has_methods'   => empty($this->mehods)
            //'branch' => $this->branch,
        ];
    }
}
