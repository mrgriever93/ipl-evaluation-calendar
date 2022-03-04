<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FaseCalendarioResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'nome'                      => $this->nome,
            'descricao'                 => $this->descricao,
            'ordem'                     => $this->ordem,
            'update'                    => true,
            // TODO: Remover se não for necessário até ao final
            'inativo'                   => $this->inativo ? true : false,
            'traducoes'                 => TraducaoResource::collection($this->whenLoaded('traducoes')),
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
            '_rowVariant'               => ''
        ];
    }
}
