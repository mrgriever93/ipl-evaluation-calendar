<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SemesterResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'name' => $this->name,
            'epochs' => EpochTypesResource::collection($this->epochTypes),
        ];
    }
}
