<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AvailableMethodsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this["id"],
            'name' => ($request->header("lang") == "en" ? $this["evaluation_type"]["name_en"] : $this["evaluation_type"]["name_pt"]),
            'minimum' => $this["minimum"],
            'weight' => $this["weight"]
        ];
    }
}
