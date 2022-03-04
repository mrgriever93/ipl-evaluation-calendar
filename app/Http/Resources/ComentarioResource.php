<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ComentarioResource extends JsonResource
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
            'avaliacao_id'                  => $this->avaliacao_id,
            'descricao'                     => $this->descricao,
            'ignorar'                       => $this->ignorar,
            'data_criacao'                  => $this->created_at,
            'utilizador_criador_nome'       => $this->utilizadorCriador->nome,
            'utilizador_modificador_nome'   => $this->utilizadorModificador->nome
        ];
    }
}
