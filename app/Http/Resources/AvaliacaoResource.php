<?php

namespace App\Http\Resources;

use App\Models\Epoca;

use Illuminate\Http\Resources\Json\JsonResource;

class AvaliacaoResource extends JsonResource
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
            'id'                                => $this->id,
            'ano'                               => $this->ano,
            'semana'                            => $this->semana,
            'data'                              => $this->data,
            'hora'                              => substr($this->hora, 0, 5), // não precisa de devolver os segundos
            'duracao_minutos'                   => $this->duracao_minutos,
            'observacoes'                       => $this->observacoes,
            'metodo_avaliacao'                  => new MetodoAvaliacaoResource($this->metodoAvaliacao),
            'comentarios'                       => ComentarioResource::collection($this->comentarios),
        ];
    }
}
