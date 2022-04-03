<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarPermissionsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'phase_id' => $this->phase_id,
            'name'     => $this->permission->code,
        ];
    }
}
