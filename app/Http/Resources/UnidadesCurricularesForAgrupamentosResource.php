<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UnidadesCurricularesForAgrupamentosResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'curso_id' => $this->curso->id,
            'curso_nome' => $this->curso->nome,
            'codigo' => $this->codigo,
            'nome' => $this->nome,
            'sigla' => $this->sigla,
            'ramo_id' => $this->ramos->id,
            'ramo_nome' => $this->ramos->nome,
            'ano_curricular' => $this->ano_curricular,
        ];
    }
}
