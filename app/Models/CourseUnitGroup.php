<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use tiagomichaelsousa\LaravelFilters\Traits\Filterable;

class CourseUnitGroup extends Model
{
    use HasFactory, Filterable;

    protected $fillable = [
        "description_pt",
        "description_en"
    ];

    public function courseUnits()
    {
        return $this->hasMany(CourseUnit::class);
    }
}
