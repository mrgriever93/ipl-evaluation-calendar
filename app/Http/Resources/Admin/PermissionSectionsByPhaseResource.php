<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\PermissionsPhaseResource;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionSectionsByPhaseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'phase_id'  => $this->id,
            'label'     => ($request->header("lang") == "en" ? $this->description_en : $this->description_pt),
            'sections'  => $this->sections
        ];
    }
}
