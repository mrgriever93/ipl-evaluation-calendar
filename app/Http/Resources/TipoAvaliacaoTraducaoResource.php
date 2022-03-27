<?php

namespace App\Http\Resources;

use App\Models\Traducao;
use App\Models\Idioma;
use \Config as Config;

use Illuminate\Http\Resources\Json\JsonResource;

class TipoAvaliacaoTraducaoResource extends JsonResource
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
        $traducaoNome       = $this->nome;
        $traducaoDescricao  = $this->descricao;

        // se o idioma for válido!
        if($this->idioma !=Config::get('constants.app.lang') && Idioma::where('abreviatura', '=', $this->idioma)->first()) {
            // procura pela tradução!
            $traducao = Traducao::where('origem_id', '=', $this->id)
                                ->where('entidade_id', '=', Config::get('constants.entidades.tipos_avaliacoes'))
                                ->first();

            if($traducao) {
                $traducaoNome       = $traducao->nome;
                $traducaoDescricao  = $traducao->descricao;
            }
        }

        return [
            'id'                                => $this->id,
            'nome'                              => $traducaoNome,
            'descricao'                         => $traducaoDescricao,
            'update'                            => true,
            'inativo'                           => $this->inativo,
            'traducoes'                         => TraducaoResource::collection($this->traducoes),
            'utilizador_id_criador'             => $this->utilizador_id_criador,
            'utilizador_id_modificador'         => $this->utilizador_id_modificador,
            'created_at'                        => $this->created_at,
            'updated_at'                        => $this->updated_at,
        ];
    }
}
