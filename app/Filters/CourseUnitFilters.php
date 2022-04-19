<?php

namespace App\Filters;

use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Epoch;
use App\Models\Exam;
use App\Models\Method;
use Illuminate\Database\Eloquent\Builder;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CourseUnitFilters extends QueryFilters
{

    public function search($search) {
        $lang = (in_array($this->request->header("lang"), ["en", "pt"]) ? $this->request->header("lang") : "pt");
        return $this->builder->where('name_' . $lang, 'like', "%{$search}%");
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
