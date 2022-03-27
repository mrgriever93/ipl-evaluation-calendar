<?php

namespace App\Http\Resources;

use App\Models\Idioma;
use Illuminate\Http\Resources\Json\JsonResource;

class TraducaoResource extends JsonResource
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
            'id'                        => $this->id,
            'id_idioma'                 => $this->idioma->id,
            'por_omissao'               => $this->idioma->por_omissao,
            'nome_in_idiomas'           => $this->idioma->nome,
            'abreviatura_in_idiomas'    => $this->idioma->abreviatura,
//            'nome_traducao'             => $this->nome,
//            'descricao_traducao'        => $this->descricao,
//            'idioma'                     => new IdiomaResource(Idioma::find($this->idioma_id)),
//            'idioma'                    => $this->idioma,
            'origem_id'                 => $this->origem_id,
            'entidade_id'               => $this->entidade_id,
            'nome'                      => $this->nome,
            'descricao'                 => $this->descricao,
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
        ];
    }
}

