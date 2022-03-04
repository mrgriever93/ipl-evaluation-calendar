<?php

namespace App\Filters;

use App\Course;
use App\CourseUnit;
use App\Epoch;
use App\Exam;
use App\Method;
use Illuminate\Database\Eloquent\Builder;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CourseUnitFilters extends QueryFilters
{

    public function search($search) {
        return $this->builder->where('name', 'like', "%{$search}%");
    }

    public function semester($semester) {
        return $this->builder->where('semester', $semester);
    }

    public function epoch($epoch)
    {
        Epoch::findOrFail($epoch);

        return $this->builder->whereHas('methods', function (Builder $query) use ($epoch) {
            $query->whereHas('epochs', function (Builder $queryEpochs) use ($epoch){
                $queryEpochs->where('epoch_id', $epoch);
            });
        });
    }

    public function year($year)
    {
        return $this->builder->where('curricular_year', $year);
    }

    public function course($course)
    {
        Course::findOrFail($course);
        return $this->builder->where('course_id', $course);
    }

    public function withoutGroup() {
        return $this->builder->where('course_unit_group_id', null);
    }

    public function including($ids) {
        return $this->builder->orWhereIn('id', json_decode($ids));
    }

    public function onlyRemaining()
    {
        return $this->builder->whereHas('methods', function (Builder $query) {
            $query->whereDoesntHave('exams');
        });
    }
}
