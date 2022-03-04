<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MethodResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->evaluationType->description,
            'epoch' => EpochResource::collection($this->epochs),
            'minimum' => $this->minimum,
            'weight' => $this->weight
        ];
    }
}
