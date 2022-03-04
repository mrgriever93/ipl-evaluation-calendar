<?php

namespace App\Http\Resources;

use App\Traducao;
use App\Idioma;
use \Config as Config;

use Illuminate\Http\Resources\Json\JsonResource;

class TipoInterrupcaoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                            => $this->id,
            'nome'                          => $this->nome,
            'descricao'                     => $this->descricao,
            'update'                        => true,
            'inativo'                       => $this->inativo?true:false,
            'traducoes'                     => TraducaoResource::collection($this->traducoes),
            'utilizador_id_criador'         => $this->utilizador_id_criador,
            'utilizador_id_modificador'     => $this->utilizador_id_modificador,
            'created_at'                    => $this->created_at,
            'updated_at'                    => $this->updated_at,
        ];
    }
}
