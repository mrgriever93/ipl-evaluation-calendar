<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RamosResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'=>$this->id,
            'curso_id'=>$this->curso_id,
            'ramo_id'=>$this->ramo_id,
            'nome'=>$this->nome,
            'sigla'=>$this->sigla,
        ];
    }
}
