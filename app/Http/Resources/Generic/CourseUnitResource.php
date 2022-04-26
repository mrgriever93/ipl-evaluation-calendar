<?php

namespace App\Http\Resources\Generic;

use App\Http\Resources\MethodResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitResource extends JsonResource
{
    public function toArray($request)
    {
        return [

            'id' => $this->id,
            'name' => ($request->header("lang") == "en" ? $this->name_en : $this->name_pt),
            'initials' => $this->initials,
            'group_name' => $this->group->description ?? null,
            'course_description' => "{$this->course->name} ({$this->course->code})",
            'code' => $this->code,
            'curricularYear' => $this->curricular_year,
            'semester' => $this->semester,
            'responsible_name' => $this->whenLoaded('responsibleUser', is_null($this->responsibleUser) ? null :  $this->responsibleUser->name),
            'responsible_email' => $this->whenLoaded('responsibleUser', is_null($this->responsibleUser) ? null :  $this->responsibleUser->email),
            'responsible_id' => $this->whenLoaded('responsibleUser', $this->responsible_user_id),

            'branch' => $this->branch,
            'methods' => MethodResource::collection($this->whenLoaded('methods')),
            'teachers' => UserResource::collection($this->teachers)
        ];
    }
}
