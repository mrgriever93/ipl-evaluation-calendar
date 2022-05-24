<?php

namespace App\Filters;

use App\Models\Calendar;
use App\Models\Course;
use App\Models\Epoch;
use App\Models\InitialGroups;
use App\Models\CalendarPhase;
use App\Models\Semester;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use tiagomichaelsousa\LaravelFilters\QueryFilters;

class CalendarFilters extends QueryFilters
{

    public function myCourseOnly($search)
    {
        $user = Auth::user();
        if ($user->groups->contains('name', InitialGroups::GOP)
        || $user->groups->contains('name', InitialGroups::BOARD)
        || $user->groups->contains('name', InitialGroups::ADMIN)
        || $user->groups->contains('name', InitialGroups::PEDAGOGIC)
        || $user->groups->contains('name', InitialGroups::RESPONSIBLE_PEDAGOGIC)
        || $user->groups->contains('name', InitialGroups::SUPER_ADMIN)
        )
            return;

        if (count($user->groups) === 1 && $user->groups->contains('description', InitialGroups::STUDENT)) {
            if ($search === "true") {
                return $this
                            ->builder
                            ->published()
                            ->whereIn('course_id', Auth::user()->courses->pluck('id'))
                            ->orWhere('calendar_phase_id', CalendarPhase::where('name', 'evaluation_students')->first()->id)
                            ->whereIn('course_id', Auth::user()->courses->pluck('id'));
            }

            return $this
                        ->builder
                        ->published()
                        ->orWhere('calendar_phase_id', CalendarPhase::where('name', 'evaluation_students')->first()->id)
                        ->whereIn('course_id', Auth::user()->courses->pluck('id'));
        }

        if ($user->groups->contains('name', InitialGroups::COORDINATOR)) {
            $this->builder->whereIn('course_id', Course::where('coordinator_user_id', Auth::user()->id)->pluck('id'));
        }

        if ($user->groups->contains('name', InitialGroups::TEACHER)) {
            if ($search === "true") {
                return $this->builder->orWhereIn('course_id', Auth::user()->courseUnits->pluck('course_id'));
            }

            return $this->builder->whereIn('course_id', Auth::user()->courseUnits->pluck('course_id'))->orPublished();
        }
    }


    public function semester($semester) {
        return $this->builder->where('semester_id',  Semester::where('code', $semester)->first()->id);
    }

    public function course($course)
    {
        Course::findOrFail($course);
        return $this->builder->where('course_id', $course);
    }
}
