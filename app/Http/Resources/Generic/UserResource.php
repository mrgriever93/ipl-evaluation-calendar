<?php

namespace App\Http\Resources\Generic;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'    => $this->id,
            'email'  => $this->email,
            'name'   => $this->name,
            'enabled' => $this->enabled,
            'groups' => $this->groups->pluck("code")->toArray()
        ];
    }
}
