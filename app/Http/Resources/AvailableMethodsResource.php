<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AvailableMethodsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->description,
            'minimum' => $this->minimum,
            'weight' => $this->weight
        ];
    }
}
