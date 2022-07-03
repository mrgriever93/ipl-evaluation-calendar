<?php

namespace App\Filters;

use App\Models\Course;
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
        // const GOP = "gop";
        // const SUPER_ADMIN = "super_admin";
        // const BOARD = "board";
        // const ADMIN = "admin";
        // const PEDAGOGIC = "pedagogic";
        // const RESPONSIBLE_PEDAGOGIC = "responsible_pedagogic";
        // const TEACHER = "teacher";
            // const COMISSION_CCP = "comission";
            // const RESPONSIBLE = "responsible_course_unit";
            // const COORDINATOR = "coordinator";
            // const STUDENT = "Estudante";


        $user = Auth::user();

        // if any of this groups, then exit
        //if (
        //    $user->groups->contains('code', InitialGroups::ADMIN) || $user->groups->contains('code', InitialGroups::SUPER_ADMIN) ||
        //    $user->groups->contains('code', InitialGroups::GOP) || $user->groups->contains('code', InitialGroups::BOARD) ||
        //    $user->groups->contains('code', InitialGroups::PEDAGOGIC) || $user->groups->contains('code', InitialGroups::RESPONSIBLE_PEDAGOGIC)
        //) {
        //    return;
        //}

        if (count($user->groups) === 1 && $user->groups->contains('code', InitialGroups::STUDENT)) {
            if ($search === "true") {
                return $this->builder->published()
                            ->whereIn('course_id', Auth::user()->courses->pluck('id'))
                            ->orWhere('calendar_phase_id', CalendarPhase::phaseEvaluationStudents());
            }

            return $this->builder->published()
                        ->orWhere('calendar_phase_id', CalendarPhase::phaseEvaluationStudents())
                        ->whereIn('course_id', Auth::user()->courses->pluck('id'));
        }

        if ($user->groups->contains('code', InitialGroups::COORDINATOR)) {
            $this->builder->whereIn('course_id', Course::where('coordinator_user_id', Auth::user()->id)->pluck('id'));
        }

        if ($user->groups->contains('code', InitialGroups::TEACHER)) {
            if ($search === "true") {
                return $this->builder->orWhereIn('course_id', Auth::user()->courseUnits->pluck('course_id'));
            }
            return $this->builder->whereIn('course_id', Auth::user()->courseUnits->pluck('course_id'))->orPublished();
        }

        // TODO validate if this is the best option
        $user_groups = [];
        foreach ($user->groups->toArray() as $group){
            $user_groups[] = $group["id"];
        }
        $this->builder->whereHas('viewers', function (Builder $query) use($user_groups) {
            $query->whereIn('group_id', $user_groups);
        });
        // TODO END
    }


    public function semester($semester) {
        return $this->builder->where('semester_id',  Semester::find($semester)->id);
    }


    public function status($status) {
        if($status == 1) {
            return $this->builder->where('is_temporary', 0)->where('is_published', 0);
        }
        if($status == 2) {
            return $this->builder->where('is_temporary', 1)->where('is_published', 0);
        }
        if($status == 3) {
            return $this->builder->where('is_temporary', 0)->where('is_published', 1);
        }
    }

    public function phase($phase) {
        return $this->builder->where('calendar_phase_id',  $phase);
    }


    public function course($course)
    {
        $user = Auth::user();
        Course::findOrFail($course);

        if ($user->groups->contains('code', InitialGroups::ADMIN) || $user->groups->contains('code', InitialGroups::SUPER_ADMIN)){
            return $this->builder->where('course_id', $course);
        }

        if (count($user->groups) === 1 && $user->groups->contains('code', InitialGroups::STUDENT)) {
            return $this->builder->whereIn('course_id', Auth::user()->courses->pluck('id'))
                                ->where('course_id', $course);
        }

        if ($user->groups->contains('code', InitialGroups::COORDINATOR)) {
            return $this->builder->whereIn('course_id', Course::where('coordinator_user_id', Auth::user()->id)->pluck('id'))
                                ->where('course_id', $course);
        }

        if ($user->groups->contains('code', InitialGroups::TEACHER)) {
            return $this->builder->whereIn('course_id', Auth::user()->courseUnits->pluck('course_id'))
                                ->where('course_id', $course);
        }
    }
}
