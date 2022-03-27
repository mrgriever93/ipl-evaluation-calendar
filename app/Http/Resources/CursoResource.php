<?php

namespace App\Http\Resources;

use App\Models\AnoLetivo;
use App\Http\Resources\AnoLetivoResource;

use Illuminate\Http\Resources\Json\JsonResource;

class CursoResource extends JsonResource
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
            'ano_letivo_codigo' => $this->anoletivo->codigo,
            'ano_letivo_id' => $this->anoletivo->id,
            'unidade_ensino_codigo' => $this->unidadeensino->codigo,
            'unidade_ensino_id' => $this->unidadeensino->id,
            'id'                            => $this->id,
            'codigo'                        => $this->codigo,
            'nome'                          => $this->nome,
            'sigla'                         => $this->sigla,
            'plano'                         => $this->plano,
            'grau_ensino'                   => $this->grau_ensino,
            'numero_anos'                   => $this->numero_anos,
            'ano_letivo'                    => new AnoLetivoResource(AnoLetivo::find($this->ano_letivo_id)), //$this->anoletivo->descricao??codigo, TODO
            'ramos'                         => $this->ramos,
            'ultima_versao'                 => $this->ultima_versao,
            'unidades_curriculares'         => UnidadesCurricularesResource::collection($this->unidadesCurriculares),
            'utilizador_id_criador'         => $this->utilizadorCriador->nome,
            'utilizador_id_modificador'     => $this->utilizadorModificador->nome,
            'utilizador_id_coordenador'     => $this->utilizador_id_coordenador != null ? $this->utilizador_id_coordenador : "-",
            'utilizador_nome_coordenador'     => $this->utilizador_id_coordenador != null ? $this->utilizadorCoordenador->nome : "-",
            'created_at'                    => $this->created_at,
            'updated_at'                    => $this->updated_at,
        ];
    }
}
