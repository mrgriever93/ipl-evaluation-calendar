<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use tiagomichaelsousa\LaravelFilters\Traits\Filterable;

class CourseUnitGroup extends Model
{
    use HasFactory, Filterable;

    protected $fillable = [
        "description"
    ];

    public function courseUnits()
    {
        return $this->hasMany(CourseUnit::class);
    }
}
