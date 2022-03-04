<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            'description'               => $this->description,
            'removable'                 => $this->when($this->whenLoaded('permissions', false), $this->removable),
            'enabled'                   => $this->when($this->whenLoaded('permissions', false), $this->enabled),
            'permissions'               => PermissionsResource::collection($this->whenLoaded('permissions')),
            'phase_id'                  => $this->whenPivotLoaded('phase_id', function() {
                return $this->pivot->phase_id;
            })
        ];
    }
}
