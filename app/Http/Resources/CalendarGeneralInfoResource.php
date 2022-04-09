<?php

namespace App\Http\Resources;

use App\Http\Resources\Generic\CourseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarGeneralInfoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'phase' => new PhaseResource($this['phase']),
            'temporary' => $this['calendar']->temporary,
            'course' => new CourseResource($this['course']),
            'calendar_last_update' => $this['calendar']->updated_at
        ];
    }
}
