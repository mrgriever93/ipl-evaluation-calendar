<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "initials",
        "course_id"
    ];

    public $timestamps = false;

    public function course() {
        return $this->belongsTo(Course::class);
    }
}
