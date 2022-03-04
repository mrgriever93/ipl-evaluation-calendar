<?php

namespace App;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use tiagomichaelsousa\LaravelFilters\Traits\Filterable;

class CourseUnit extends Model
{
    use HasFactory, Filterable;
    use \Staudenmeir\EloquentHasManyDeep\HasRelationships;
    use \Znck\Eloquent\Traits\BelongsToThrough;

    protected $fillable = [
        "course_id",
        "branch_id",
        "responsible_user_id",
        "code",
        "name",
        "initials",
        "curricular_year",
        "semester",
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function academicYears(){
        return $this->belongsToMany(AcademicYear::class);
    }

    public function branch() {
        return $this->belongsTo(Branch::class);
    }

    public function group()
    {
        return $this->belongsTo(CourseUnitGroup::class, 'course_unit_group_id');
    }

    public function methods()
    {
        return $this->belongsToMany(Method::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class);
    }

    public function exams()
    {
        return $this->hasManyDeepFromRelations($this->methods(), (new Method)->exams());
    }

    public function responsibleUser() {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function scopeOfAcademicYear($query, $academicYearId) {
        return $query->whereHas('academicYears', function (Builder $q) use($academicYearId) {
            $q->where('academic_year_id', $academicYearId);
        });
    }

    public function school() {
        return $this->belongsToThrough(School::class, Course::class);
    }
}
