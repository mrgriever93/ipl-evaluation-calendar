<?php

namespace App\Http\Resources;

use App\Idioma;
use App\Permissao;
use Illuminate\Http\Resources\Json\JsonResource;

class GrupoPermissaoAssocResource extends JsonResource
{
    public function toArray($request){
       // dd($this);
        return [
            'id'                        => $this->pivot->id,
            'categoria'                 => $this->categoria,
            'permissao_nome'            => $this->nome,
            'permissao_descricao'       => $this->descricao,
            'utilizador_id_criador'     => $this->utilizador_id_criador,
            'utilizador_id_modificador' => $this->utilizador_id_modificador,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,
            'grupo_id'                  => $this->pivot->grupo_id,
            'permissao_id'              => $this->pivot->permissao_id,
            'consultar'                 => $this->pivot->consultar         ? true : false,
            'consultar_todos'           => $this->pivot->consultar_todos   ? true : false,
            'adicionar'                 => $this->pivot->adicionar         ? true : false,
            'modificar'                 => $this->pivot->modificar         ? true : false,
            'modificar_todos'           => $this->pivot->modificar_todos   ? true : false,
            'apagar'                    => $this->pivot->apagar            ? true : false,
            'apagar_todos'              => $this->pivot->apagar_todos      ? true : false,
        ];
    }
}

