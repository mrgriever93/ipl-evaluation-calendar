<?php

namespace App\Http\Resources;

use App\FaseCalendario;
use App\GrupoFasePermissaoAssoc;
use App\Permissao;
use Illuminate\Http\Resources\Json\JsonResource;

class GrupoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                                => $this->id,
            'nome'                              => $this->nome,
            'descricao'                         => $this->descricao,
            'update'                            => true,
            'inativo'                           => $this->inativo ? true : false,
            /*'permissoes'                        => GrupoPermissaoAssocResource::collection($this->grupoPermissaoAssocs),*/
            /*'permissoesFase'                    => GrupoFasePermissaoAssocResource::collection($this->grupoFasePermissaoAssocs->sortBy(
                                                                                                    function($item, $key) {
                                                                                                        $fase = FaseCalendario::find($item->fase_calendario_id);
                                                                                                        return $fase != null ? $fase->ordem : 1;
                                                                                                    }
                                                                                                )),*/
            'tiposFase'                         => $this->whenLoaded('tiposFase', FaseCalendarioResource::collection(FaseCalendario::all())),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
