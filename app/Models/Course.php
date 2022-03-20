<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Config;
use LdapRecord\Connection;
use tiagomichaelsousa\LaravelFilters\Traits\Filterable;

class Course extends Model
{
    use HasFactory, Filterable, SoftDeletes;

    protected $fillable = ["code", "name", "initials", "degree", "num_years", "coordinator_user_id", "school_id"];

    public function academicYears()
    {
        return $this->belongsToMany(AcademicYear::class);
    }

    public function coordinatorUser() {
        return $this->belongsTo(User::class, 'coordinator_user_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_user');
    }

    public function calendars()
    {
        return $this->hasMany(Calendar::class);
    }

    public function school() {
        return $this->belongsTo(School::class);
    }

    public function branches() {
        return $this->hasMany(Branch::class);
    }

    public function courseUnits() {
        return $this->hasMany(CourseUnit::class);
    }

    public function scopeOfAcademicYear($query, $academicYear) {
        return $query->whereHas('academicYears', function (Builder $q) use($academicYear) {
            return $q->where('academic_year_id', AcademicYear::findOrFail($academicYear)->id);
        });
    }

    public static function importCoursesFromWebService($academicYearCode)
    {
        $schools = School::whereNotNull('base_link')->get();
        $academicYearId = AcademicYear::where('code', $academicYearCode)->first()->id;
        $connection = new Connection([
            'hosts'    => [env('LDAP_HOST')],
            'username' => env('LDAP_USERNAME'),
            'password' => env('LDAP_PASSWORD'),
             'version' => 3,
         ]);
         $LdapConnection = $connection->query()->setDn('OU=Funcionarios,dc=ipleiria,dc=pt');

        foreach ($schools as $school) {
            foreach ([1, 2] as $semester) {
                $apiEndpoint = "{$school->base_link}?{$school->query_param_academic_year}={$academicYearCode}&{$school->query_param_semester}=S{$semester}";
                $courseUnits = [];

                array_push($courseUnits, ...explode("<br>", mb_convert_encoding(file_get_contents($apiEndpoint), "utf-8", "latin1")));

                foreach ($courseUnits as $courseUnit) {
                    if (!empty($courseUnit)) {
                        $info = explode(";", $courseUnit);
                        if (Course::where('code', $info[$school->index_course_code])->get()->count() == 0) {
                            Course::create([
                                "school_id" => $school->id,
                                "code" => $info[$school->index_course_code],
                                "name" => $info[$school->index_course_name],
                            ]);
                        }

                        $course = Course::where('code', $info[$school->index_course_code])->first();

                        $course->academicYears()->syncWithoutDetaching(AcademicYear::where('code', $academicYearCode)->first()->id);

                        if (Branch::where('course_id', $course->id)->get()->count() == 0) {
                            $newBranch = new Branch([
                                "course_id" => $course->id,
                                "name" => "Tronco Comum",
                                "initials" => "TComum"
                            ]);
                            $newBranch->save();
                        }
                        $newestCourseUnit = CourseUnit::where('code', $info[$school->index_course_unit_code])->first();
                        if (is_null($newestCourseUnit)) {
                            $newestCourseUnit = CourseUnit::create([
                                "course_id" => $course->id,
                                "code" => $info[$school->index_course_unit_code],
                                "branch_id" => Branch::where('course_id', $course->id)->first()->id,
                                "semester" => $semester,
                                "curricular_year" => $info[$school->index_course_unit_curricular_year],
                                "name" => $info[$school->index_course_unit_name],
                            ]);
                        }

                        $newestCourseUnit->academicYears()->syncWithoutDetaching($academicYearId);

                        $teachers = explode(",", $info[$school->index_course_unit_teachers]);
                        $teachersForCourseUnit = [];
                        foreach ($teachers as $teacher) {
                            if (!empty($teacher)) {
                                preg_match('#\((.*?)\)#', $teacher, $match);
                                $username = trim($match[1]);
                                if (!empty($username)) {
                                    $userEmail = "{$username}@ipleiria.pt";
                                    $foundUser = User::where("email", $userEmail)->first();
                                    if (is_null($foundUser)) {

                                        $ldapUser = (clone $LdapConnection)->whereContains('mailNickname', $username)->orWhereContains('mail', $userEmail)->first('cn');
                                        $foundUser = User::create([
                                            "email" => $userEmail,
                                            "name" => $ldapUser['cn'][0],
                                            "password" => "",
                                        ]);
                                    }
                                    $foundUser->groups()->syncWithoutDetaching(Group::isTeacher()->get());
                                    $teachersForCourseUnit[] = $foundUser->id;
                                }
                            }

                        }

                        $newestCourseUnit->teachers()->sync($teachersForCourseUnit, true);
                    }
                }

                $courses = Course::whereNull('num_years')->get();

                foreach ($courses as $course) {
                    $course->num_years = $course->courseUnits()->max('curricular_year');
                    $course->save();
                }
            }
        }

    }
}
