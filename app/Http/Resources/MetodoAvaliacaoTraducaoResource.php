<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use App\Models\TipoAvaliacao;

class MetodoAvaliacaoTraducaoResource extends JsonResource
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
            'id'                                => $this->id,
            'minimo'                            => $this->minimo,
            'peso'                              => $this->peso,
            'tipo_avaliacao'                    => new TipoAvaliacaoTraducaoResource($this->tipoAvaliacao, $this->idioma),
            'unidade_curricular'                => UnidadeCurricularSemanalResource::collection($this->unidadeCurricular), // TODO: melhorar...
            'epoca'                             => $this->epoca=='periodica' ? 'periodica'
                                                    : ($this->epoca=='normal' ? 'normal'
                                                        : ($this->epoca=='recurso' ? 'recurso'
                                                            : ($this->epoca=='especial' ? 'especial'
                                                            : '-')
                                                        )
                                                    ),
            'avaliacao_id'                      => $this->avaliacao_id, // importante calendario: só precisa de id e data
            'avaliacao_data'                    => $this->avaliacao != null ? $this->avaliacao->data : '', // importante calendario: só precisa de id e data
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
