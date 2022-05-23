<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\CalendarGeneralInfoResource;
use App\Http\Resources\Generic\CourseResource;
use App\Http\Resources\InterruptionResource;
use App\Http\Resources\PhaseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarDetailResource extends JsonResource
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
            'semester'  => $this->semester->special ? "Especial" : $this->semester->number,
            'epochs' => EpochCalendarResource::collection($this->whenLoaded('epochs', $this->epochs()->with(['exams', 'exams.comments'])->get())),
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
