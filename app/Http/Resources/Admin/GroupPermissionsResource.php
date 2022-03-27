<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupPermissionsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'description'               => ($request->lang == "en" ? $this->description_en : $this->description_pt),
            'isActive'                  => false,//$this->group()->relation()->exists(),
        ];
    }
}
