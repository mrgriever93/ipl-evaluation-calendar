<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class InterruptionTypeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name'        => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'description' => ($request->header("lang") == "en" ? $this->description_en : $this->description_pt),
            'enabled'     => $this->enabled,
        ];
    }
}
