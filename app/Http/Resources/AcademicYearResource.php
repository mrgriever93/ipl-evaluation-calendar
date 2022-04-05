<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AcademicYearResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'code'              => $this->code,
            'display'           => $this->display,
            'selected'          => !!$this->selected,//$request->hasCookie('academic_year') ? $this->id == $request->cookie('academic_year') : $this->active,
            'active'            => !!$this->active,
            'isActiveLoading'   => false,
            'isSelectedLoading' => false
        ];
    }
}
