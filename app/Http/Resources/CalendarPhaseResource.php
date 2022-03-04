<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarPhaseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'removable' => $this->removable,
            'enabled' => $this->enabled,
        ];
    }
}
