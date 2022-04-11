<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\Generic\UserWithGroupsResource;
use App\Services\DegreesUtil;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchesResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'initials' => $this->initials,
            'name' => $this->name
        ];
    }
}
