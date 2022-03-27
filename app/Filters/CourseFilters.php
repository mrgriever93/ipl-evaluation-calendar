<?php

namespace App\Filters;

use App\Models\Course;
use App\Models\Epoch;
use Illuminate\Database\Eloquent\Builder;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CourseFilters extends QueryFilters
{

    public function search($search)
    {
        return $this->builder->where('code', 'LIKE', "%$search%")->orWhere('initials', 'LIKE', "%$search%")->orWhere('name', 'LIKE', "%$search%");
    }
}
