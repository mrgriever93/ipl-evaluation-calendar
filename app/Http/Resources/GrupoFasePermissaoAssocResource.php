<?php

namespace App\Http\Resources;

use App\Models\Idioma;
use Illuminate\Http\Resources\Json\JsonResource;

class GrupoFasePermissaoAssocResource extends JsonResource
{
    public function toArray($request){
        return [
            'id'                        => $this->id,
            'grupo_id'                  => $this->grupo_id,
            'fase_calendario_id'        => $this->fase_calendario_id,
            'fase_calendario'           => new FaseCalendarioResource($this->faseCalendario),
            'permissao_id'              => $this->permissao_id,
            'permissao_nome'            => $this->permissao->nome,
            'permissao_descricao'       => $this->permissao->descricao,
            'isolada'                   => $this->permissao->isolada? true : false,
            'consultar'                 => $this->consultar         ? true : false,
            'consultar_todos'           => $this->consultar_todos   ? true : false,
            'adicionar'                 => $this->adicionar         ? true : false,
            'modificar'                 => $this->modificar         ? true : false,
            'modificar_todos'           => $this->modificar_todos   ? true : false,
            'apagar'                    => $this->apagar            ? true : false,
            'apagar_todos'              => $this->apagar_todos      ? true : false,
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
        ];
    }
}

