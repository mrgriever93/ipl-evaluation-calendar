<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MetodosAvaliacaoResource extends JsonResource
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
            'tipo_avaliacao'=>$this->tipoAvaliacao->nome,
            'tipo_avaliacao_id'=>$this->tipoAvaliacao->id,
            //'unidade_curricular'=>$this->unidadeCurricular->nome,
            'unidade_curricular'=> UnidadeCurricularForMetodosResource::collection($this->unidadeCurricular),
            //'unidade_curricular_id'=>$this->unidade_curricular_id,
            'minimo'=>$this->minimo,
            'epoca'=>$this->epoca=='periodica'?'periodica':($this->epoca=='normal'?'normal':($this->epoca=='recurso'?'recurso':($this->epoca=='especial'?'especial':'-'))),
            'peso'=>$this->peso,
        ];
    }
}
