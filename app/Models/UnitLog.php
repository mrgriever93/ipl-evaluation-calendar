<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitLog extends Model
{
    use HasFactory;

    protected $table = "course_unit_logs";

    protected $fillable = [
        "description",
        "course_unit_id",
        "user_id"
    ];

    public function courseUnits() {
        return $this->belongsTo(CourseUnit::class);
    }
}
