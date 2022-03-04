<?php

namespace App\Filters;

use App\Course;
use App\Epoch;
use Illuminate\Database\Eloquent\Builder;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CourseFilters extends QueryFilters
{

    public function search($search)
    {
        return $this->builder->where('code', 'LIKE', "%$search%")->orWhere('initials', 'LIKE', "%$search%")->orWhere('name', 'LIKE', "%$search%");
    }
}
