<?php

namespace App\Http\Resources;

use App\Models\Epoca;
use App\Models\Avaliacao;
use App\Http\Resources\AvaliacaoResource;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarioAvaliacaoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                                => $this->id,
            'semestre'                          => $this->semestre,
            'observacoes'                       => $this->observacoes,
            'provisorio'                        => $this->provisorio,
            'obsoleto'                          => $this->trashed(),
            // TODO: eliminar obsoleto da BD se não for necessário até ao final
            //'obsoleto'                          => $this->obsoleto,
            'versao'                            => $this->versao,
            'curso'                             => new CursoResource($this->curso),
            'fase_calendario'                   => new FaseCalendarioResource($this->faseCalendario),
            'epoca_periodica'                   => new EpocaResource($this->epocaPeriodica),
            'epoca_normal'                      => new EpocaResource($this->epocaNormal),
            'epoca_recurso'                     => new EpocaResource($this->epocaRecurso),
            'epoca_especial'                    => new EpocaResource($this->epocaEspecial),
            //'interrupcoes'                      => InterrupcaoResource::collection($this->interrupcoes),
            // TODO
            //'avaliacoes'                        => AvaliacaoResource::collection($this->avaliacoes),
            // TODO
            //'metodos_avaliacao'                 => MetodoAvaliacaoResource::collection($this->avaliacoes),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
