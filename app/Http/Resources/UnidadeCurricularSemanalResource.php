<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UnidadeCurricularSemanalResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                            => $this->id,
            'curso_id'                      => $this->curso->id,
            'utilizador_id_responsavel'     => $this->utilizador_id_responsavel,
            'utilizador_id_criador'         => $this->utilizador_id_criador,
            'utilizador_id_modificador'     => $this->utilizador_id_modificador,
            'codigo'                        => $this->codigo,
            'nome'                          => $this->nome,
            'sigla'                         => $this->sigla,
            'ramo'                          => $this->ramo,
            'ano_curricular'                => $this->ano_curricular,
            //'metodos_avaliacoes'            => MetodoAvaliacaoTraducaoResource::collection($this->metodosAvaliacoes),
            'created_at'                    => $this->created_at,
            'updated_at'                    => $this->updated_at,
        ];
    }
}
