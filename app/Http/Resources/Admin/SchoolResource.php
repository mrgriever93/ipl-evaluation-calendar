<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class SchoolResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name'        => $this->code,
            'description' => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'is_configured'   => $this->base_link != '',
        ];
    }
}
