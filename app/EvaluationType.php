<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationType extends Model
{
    use HasFactory;

    protected $fillable = ["code", "description", "enabled"];

    public function exams()
    {
        return $this->belongsToMany(Exam::class);
    }
}
