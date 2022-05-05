<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "code",
        "name_pt",
        "name_en"
    ];

    public function epochTypes() {
        return $this->belongsToMany(EpochType::class);
    }
    public function calendar() {
        return $this->belongsToMany(Calendar::class);
    }
}
