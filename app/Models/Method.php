<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Method extends Model
{
    use HasFactory;

    protected $fillable = ["evaluation_type_id", "academic_year_id", "minimum", "weight", "enabled"];

    public function academicYear() {
        return $this->belongsTo(AcademicYear::class);
    }

    public function epochType()
    {
        return $this->belongsToMany(EpochType::class);
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
