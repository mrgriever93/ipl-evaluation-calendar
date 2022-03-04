<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissaoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'nome'                      => $this->nome,
            'descricao'                 => $this->descricao,
            'categoria'                 => $this->categoria,
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
        ];
    }
}
