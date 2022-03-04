<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class IdiomaResource extends JsonResource
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
            'nome'                       => $this->nome,
            'abreviatura'                => $this->abreviatura,
            'por_omissao'                => $this->por_omissao?true:false,
            'utilizador_id_criador'      => $this->utilizador_id_criador,
            'utilizador_id_modificador'  => $this->utilizador_id_modificador,
            'created_at'                 => $this->created_at,
            'updated_at'                 => $this->updated_at,
        ];
    }
}
