<?php

namespace App\Http\Resources;


use Illuminate\Http\Resources\Json\JsonResource;

class AgrupamentosUnidadesCurricularesResourece extends JsonResource
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
            "id"=>$this->id,
            "descricao"=>$this->descricao,
            "ucs"=>UnidadesCurricularesForAgrupamentosResource::collection($this->unidadeCurricularAgrupamentoAssocs),
            "ano_letivo_id"=>$this->ano_letivo_id
        ];
    }
}
