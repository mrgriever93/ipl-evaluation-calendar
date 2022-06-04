<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\Generic\CourseResource;
use App\Http\Resources\PhaseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'display_id' => $this->previous_calendar_id ? "{$this->previous_calendar_id}.{$this->id}" : $this->id,
            'course'  => "(" . $this->course->code . ") " . ($request->header("lang") == "en" ? $this->course->name_en : $this->course->name_pt),
            'phase' => new PhaseResource($this->phase),
            'published' => $this->published,
            'temporary' => $this->temporary,
            'differences' => $this->difference_from_previous_calendar,
        ];
    }

}
