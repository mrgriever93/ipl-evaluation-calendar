<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MethodResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                    => $this->id,
            'evaluation_type_id'    => $this->evaluation_type_id,
            'name'                  => ($request->header("lang") == "en" ? $this->evaluationType->name_en : $this->evaluationType->name_pt),
            'minimum'               => (float) $this->minimum,
            'weight'                => (float) $this->weight
            //'epoch' => EpochResource::collection($this->epochs),
        ];
    }
}
