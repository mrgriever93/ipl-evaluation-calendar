<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AnoLetivoResource extends JsonResource
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
            'codigo'=>$this->codigo,
            'descricao'=>$this->descricao,
            'created_at'=>$this->created_at,
            'updated_at'=>$this->updated_at,
            'deleted_at'=>$this->deleted_at,
            'utilizador_id_criador'=>[$this->utilizadorCriador->nome,$this->utilizadorCriador->email],
            'utilizador_id_modificador'=>$this->utilizadorModificador->email,
            'ativo'=>$this->ativo==true?"Sim":"Não",
        ];
    }
}
