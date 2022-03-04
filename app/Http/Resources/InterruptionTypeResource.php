<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InterruptionTypeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'enabled'       => $this->enabled,
        ];
    }
}
