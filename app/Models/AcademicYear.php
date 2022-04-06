<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ["code", "display", "s1_sync", "s2_sync", "active", "selected"];

    public $timestamps = false;

    public function disableActiveAcademicYear() {
        return $this->active = false;
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
