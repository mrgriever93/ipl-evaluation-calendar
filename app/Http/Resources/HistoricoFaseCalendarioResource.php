<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class HistoricoFaseCalendarioResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'calendario'                => $this->calendarioAvaliacao,
            'fase_calendario'           => $this->faseCalendario,
            'observacoes'               => $this->observacoes,
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_nome_criador'   => $this->utilizadorCriador->nome,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
        ];
    }
}
