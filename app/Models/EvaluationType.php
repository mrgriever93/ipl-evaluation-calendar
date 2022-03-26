<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationType extends Model
{
    use HasFactory;

    protected $fillable = ["code", "description_pt", "description_en", "enabled"];

    public function exams()
    {
        return $this->belongsToMany(Exam::class);
    }
}
