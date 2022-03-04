<?php

namespace App\Http\Resources;

use App\Epoca;
use App\Http\Resources\MetodoAvaliacaoTraducaoResource;
use App\Http\Resources\ComentarioResource;

use Illuminate\Http\Resources\Json\JsonResource;

class AvaliacaoTraducaoResource extends JsonResource
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
            'ano'                               => $this->ano,
            'semana'                            => $this->semana,
            'data'                              => $this->data,
            'hora'                              => substr($this->hora, 0, 5), // não precisa de devolver os segundos
            'duracao_minutos'                   => $this->duracao_minutos,
            'observacoes'                       => $this->observacoes,
            'metodo_avaliacao'                  => new MetodoAvaliacaoTraducaoResource($this->metodoAvaliacao, $this->idioma),
            'comentarios'                       => ComentarioResource::collection($this->comentarios),
        ];
    } 
}
