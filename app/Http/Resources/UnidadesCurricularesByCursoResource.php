<?php

namespace App\Http\Resources;

use App\UnidadeCurricular;
use Illuminate\Http\Resources\Json\JsonResource;

class UnidadesCurricularesByCursoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'Curso'=>$this->nome,
            'Unidades Curriculares'=>UnidadesCurricularesResource::collection(UnidadeCurricular::select()->where('curso_id',$this->id)->get())
        ];
    }
}
