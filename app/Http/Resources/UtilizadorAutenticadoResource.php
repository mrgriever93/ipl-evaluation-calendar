<?php

namespace App\Http\Resources;

use App\Dicionario;
use App\Http\Resources\DicionarioResource;

use Illuminate\Http\Resources\Json\JsonResource;

class UtilizadorAutenticadoResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'email'                     => $this->email,
            'nome'                      => $this->nome,
            'tipo'                      => $this->tipo,
            'idioma'                    => $this->idioma,
            'permissoes'                => UtilizadorAutenticadoPermissoesResource::collection($this->permissoes()),
            'permissoes_calendario'     => UtilizadorAutenticadoPermissoesCalendarioResource::collection($this->permissoesCalendario()),
            'dicionario'                => DicionarioResource::collection(Dicionario::where('idioma_id', '=', $this->idioma->id)->get()),
            'grupos'                    => GrupoUserAuthResource::collection($this->grupos),
            'responsavelucs'=>UcResponsavelResource::collection($this->unidadesCurricularesResponsavel),
        ];
    }
}
