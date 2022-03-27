<?php

namespace App\Filters;

use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use Illuminate\Database\Eloquent\Builder;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CourseUnitGroupFilters extends QueryFilters
{

    public function name($name) {
        return $this->builder->where('description', 'like', "%$name%");
    }

    public function courseUnits($courseUnits)
    {
        return $this->builder->whereHas('courseUnits', function (Builder $query) use($courseUnits) {
            $query->whereIn('id', json_decode($courseUnits));
        });
    }
}
