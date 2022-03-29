<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissionsPhaseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
          /*  'section'                   => ($request->lang == "en" ? $this->section->description_en : $this->section->description_pt),
            'sectionId'                 => $this->section_id,*/
            'id'                        => $this->id,
            'description'               => ($request->lang == "en" ? $this->description_en : $this->description_pt),
            'isActive'                  => false,//$this->group()->relation()->exists(),
        ];
    }
}
