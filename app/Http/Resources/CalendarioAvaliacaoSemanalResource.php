<?php

namespace App\Http\Resources;

use App\Models\Epoca;
use App\Models\Avaliacao;
use App\Http\Resources\AvaliacaoResource;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarioAvaliacaoSemanalResource extends JsonResource
{
    private $idioma;

    public function __construct($resource, $idioma = null)
    {
        // Ensure you call the parent constructor
        parent::__construct($resource);
        $this->resource = $resource;

        $this->idioma = $idioma;
    }

    public function toArray($request)
    {
        return [
            'calendario_id'                     => $this->id,
            'semestre'                          => $this->semestre,
            'observacoes'                       => $this->observacoes,
            'provisorio'                        => $this->provisorio,
            'obsoleto'                          => $this->trashed(),
            // TODO: eliminar obsoleto da BD se não for necessário até ao final
            //'obsoleto'                          => $this->obsoleto,
            'versao'                            => $this->versao,
            'curso'                             => new CursoResource($this->curso),
            'fase_calendario'                   => new FaseCalendarioResource($this->faseCalendario),
            //'epocas'                          => EpocaResource::collection($this->epocas()), // Nota: não é do Eloquent -> tem ()
            'epoca_periodica'                   => new EpocaResource($this->epocaPeriodica, $this->idioma),
            'epoca_normal'                      => new EpocaResource($this->epocaNormal, $this->idioma),
            'epoca_recurso'                     => new EpocaResource($this->epocaRecurso, $this->idioma),
            'epoca_especial'                    => new EpocaResource($this->epocaEspecial, $this->idioma),
            // informação por semana
            'semanas'                           => $this->semanas,
            'interrupcoes'                      => InterrupcaoResource::collection($this->interrupcoes),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
