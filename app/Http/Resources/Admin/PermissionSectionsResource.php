<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissionSectionsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'label'         => ($request->header("lang") == "en" ? $this->description_en : $this->description_pt),
            'permissions'   => GroupPermissionsResource::collection($this->perm),
        ];
    }
}
