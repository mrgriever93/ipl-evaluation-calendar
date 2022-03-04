<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use App\TipoInterrupcao;

class InterrupcaoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                                => $this->id,
            'data_inicio'                       => $this->data_inicio,
            'data_fim'                          => $this->data_fim,
            'descricao'                         => $this->descricao,
            // Cuidado: loop - se colocado o Resource no TipoInterrupcao
            'tipo_interrupcao'                  => new TipoInterrupcaoResource(TipoInterrupcao::find($this->tipo_interrupcao_id)),
            // Cuidado: loop - se colocado o Resource do calendário
            'calendario_avaliacao_id'           => $this->calendario_avaliacao_id,
            // TODO: Remover se não for necessário até ao final
            //'inativo'                         => $this->inativo,
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    } 
}
