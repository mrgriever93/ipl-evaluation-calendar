<?php

namespace App\Http\Resources;

use App\Models\Traducao;
use Illuminate\Http\Resources\Json\JsonResource;

class UnidadeEnsinoResource extends JsonResource
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
            'id'                         => $this->id,
            'codigo'                       => $this->codigo,
            'descricao'                  => $this->descricao,
            'inativo'                    => $this->inativo,
            'utilizador_id_criador'      => $this->utilizador_id_criador,
            'utilizador_id_modificador'  => $this->utilizador_id_modificador,
            'created_at'                 => $this->created_at,
            'updated_at'                 => $this->updated_at,
        ];
    }
}
