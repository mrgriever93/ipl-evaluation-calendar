<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UnidadesEnsinoResource extends JsonResource
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
            'utilizador_id_criador'=>$this->utilizador_id_criador,
            'utilizador_id_modificador'=>$this->utilizador_id_modificador,
            'codigo'=>$this->codigo,
            'descricao'=>$this->descricao,
            'inativo'=>$this->inativo,
            'created_at'=>$this->created_at,
            'updated_at'=>$this->updated_at,
        ];
    }
}
