<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Method extends Model
{
    use HasFactory;

    protected $fillable = ["evaluation_type_id", "minimum", "weight", "enabled"];

    public function epochs()
    {
        return $this->belongsToMany(Epoch::class);
    }

    public function evaluationType()
    {
        return $this->belongsTo(EvaluationType::class);
    }

    public function courseUnits()
    {
        return $this->belongsToMany(CourseUnit::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}
