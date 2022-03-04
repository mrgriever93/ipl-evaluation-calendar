<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EpocaResource extends JsonResource
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
            'data_inicio'                       => $this->data_inicio,
            'data_fim'                          => $this->data_fim,
            'avaliacoes'                        => AvaliacaoTraducaoResource::collection($this->avaliacoes, $this->idioma),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
