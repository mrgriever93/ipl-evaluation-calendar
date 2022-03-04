<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UtilizadorResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'email'                     => $this->email,
            'nome'                      => $this->nome,
            'tipo'                      => $this->tipo,
            'idioma'                    => $this->idioma,
            'nome-email'=>$this->nome.' - '.$this->email,
        ];
    }
}
