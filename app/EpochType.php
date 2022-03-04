<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EpochType extends Model
{
    use HasFactory;
    
    public $timestamps = false;

    protected $fillable = [
        "name",
    ];

    public function epochs() {
        return $this->hasMany(Epoch::class);
    }

    public function semesters() {
        return $this->hasMany(Semester::class);
    }
}
