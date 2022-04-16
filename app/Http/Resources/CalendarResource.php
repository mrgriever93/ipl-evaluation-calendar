<?php

namespace App\Http\Resources;

use App\Http\Resources\Generic\CourseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'display_id' => $this->previous_calendar_id ? "{$this->previous_calendar_id}.{$this->id}" : $this->id,
            'course' => new CourseResource($this->course),
            'phase' => new PhaseResource($this->phase),
            'published' => $this->published,
            'temporary' => $this->temporary,
            'semester'  => $this->semester > 2 ? "Especial" : $this->semester,
            'epochs' => EpochResource::collection($this->whenLoaded('epochs', $this->epochs()->with(['exams', 'exams.comments'])->get())),
            'interruptions' => InterruptionResource::collection($this->whenLoaded('interruptions')),
            'general_info'  => new CalendarGeneralInfoResource([
                "phase" => $this->phase,
                "calendar" => $this,
                "course" => $this->course
            ]),
            'differences' => $this->difference_from_previous_calendar,
            'previous_from_definitive' => $this->previousCalendar ? !$this->previousCalendar->temporary : false,
        ];
    }
}
