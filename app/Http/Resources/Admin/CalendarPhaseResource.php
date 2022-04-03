<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarPhaseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => ($request->header("lang") == "en" ? $this->description_en : $this->description_pt),
            'removable'   => $this->removable,
            'enabled'     => $this->enabled,
        ];
    }
}
