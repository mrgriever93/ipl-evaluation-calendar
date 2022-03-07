<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ramo extends Model
{
    //

    use SoftDeletes;
    /**
     * @var array
     ******** ramo_id é utilizado para pôr nos cursos os ramos a iniciar sempre em 0 *******
     */
    protected $fillable = ['id','curso_id','ramo_id','nome','sigla','utilizador_id_criador', 'utilizador_id_modificador','created_at', 'updated_at'];
    protected $dates    = ['created_at', 'updated_at'];


    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function curso()
    {
        return $this->belongsTo('App\Curso','curso_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function utilizadorCriador()
    {
        return $this->belongsTo('App\User','utilizador_id_criador');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function utilizadorModificador()
    {
        return $this->belongsTo('App\User','utilizador_id_modificador');
    }

    public function unidadesCurriculares()
    {
        return $this->hasMany('App\UnidadeCurricular');
    }
}
