<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use App\Models\TipoInterrupcao;

class InterrupcaoTraducaoResource extends JsonResource
{
    private $idioma;

    public function __construct($resource, $idioma = null)
    {
        // Ensure you call the parent constructor
        parent::__construct($resource);
        $this->resource = $resource;

        $this->idioma = $idioma;
    }

    public function toArray($request)
    {
        return [
            'id'                                => $this->id,
            'data_inicio'                       => $this->data_inicio,
            'data_fim'                          => $this->data_fim,
            'descricao'                         => $this->descricao,
            // Cuidado: loop - se colocado o Resource no TipoInterrupcao
            'tipo_interrupcao'                  => new TipoInterrupcaoTraducaoResource(TipoInterrupcao::find($this->tipo_interrupcao_id), $this->idioma),
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
