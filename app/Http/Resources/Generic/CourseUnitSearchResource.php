<?php

namespace App\Http\Resources\Generic;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseUnitSearchResource extends JsonResource
{
    public function toArray($request)
    {
        $lang_header = $request->header("lang");
        return [
            'key'   => $this->id,
            'value' => $this->id,
            'text'  => "($this->code) " . ($lang_header == "en" ? $this->name_en : $this->name_pt),
        ];
    }
}
