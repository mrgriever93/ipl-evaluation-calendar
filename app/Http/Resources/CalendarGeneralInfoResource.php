<?php

namespace App\Http\Resources;

use App\Http\Resources\Generic\CourseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarGeneralInfoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'version'       => $this['version'],
            'phase'         => new PhaseResource($this['phase']),
            'temporary'     => $this['calendar']->is_temporary,
            'course'        => new CourseResource($this['course']),
            'calendar_last_update' => $this['calendar']->updated_at,
        ];
    }
}
