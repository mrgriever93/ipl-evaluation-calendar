<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EpochResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'start_date'    => $this->start_date,
            'end_date'      => $this->end_date,
            'exams'         => ExamResource::collection($this->whenLoaded('exams')),
        ];
    }
}
