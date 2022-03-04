<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use App\Avaliacao;
use App\TipoAvaliacao;

use App\Http\Resources\UnidadeCurricularResource;

class MetodoAvaliacaoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                                => $this->id,
            'minimo'                            => $this->minimo,
            'peso'                              => $this->peso,
            'tipo_avaliacao'                    => new TipoAvaliacaoResource($this->tipoAvaliacao),
            'unidade_curricular'                => new UnidadeCurricularSemanalResource($this->unidadeCurricular),
            // loop
            //'avaliacao'                         => new AvaliacaoResource($this->avaliacao),
            'epoca'=>$this->epoca=='periodica'?'periodica':($this->epoca=='normal'?'normal':($this->epoca=='recurso'?'recurso':($this->epoca=='especial'?'especial':'-'))),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
