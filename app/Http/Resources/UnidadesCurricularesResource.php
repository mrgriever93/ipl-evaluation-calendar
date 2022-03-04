<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UnidadesCurricularesResource extends JsonResource
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
            'id'                            => $this->id,
            'curso_id'                      => $this->curso->id,
            'curso_nome'                      => $this->curso->nome,
            'curso_anos'                      => $this->curso->numero_anos,
            'utilizador_id_responsavel'     => $this->utilizador_id_responsavel!=null?$this->utilizador_id_responsavel:"-",
            'utilizador_nome_responsavel'     => $this->utilizador_id_responsavel!=null?$this->utilizadorResponsavel->nome:"-",
            'utilizador_id_criador'         => $this->utilizador_id_criador,
            'utilizador_id_modificador'     => $this->utilizador_id_modificador,
            'codigo'                        => $this->codigo,
            'nome'                          => $this->nome,
            'sigla'                         => $this->sigla,
            'ramo_id'                          => $this->ramos->id,
            'ramo_nome'                          => $this->ramos->nome,
            'ano_curricular'                => $this->ano_curricular,
            'metodos_avaliacoes'            => MetodoAvaliacaoTraducaoResource::collection($this->metodosAvaliacoes),
            'created_at'                    => $this->created_at,
            'updated_at'                    => $this->updated_at,
        ];
    }
}
