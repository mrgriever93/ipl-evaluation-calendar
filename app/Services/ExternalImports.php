<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\Group;
use App\Models\Interruption;
use App\Models\InterruptionType;
use App\Models\InterruptionTypesEnum;
use App\Models\School;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use LdapRecord\Connection;

class ExternalImports
{

    public static function importYearHolidays($yearToImport, $calendarId)
    {
        $apiEndpoint = Config::get('constants.api.sapo_holidays_endpoint');
        $url = "{$apiEndpoint}?year={$yearToImport}";
        $holidays = simplexml_load_file($url);

        foreach ($holidays->GetNationalHolidaysResult->Holiday as $key => $holiday) {
            $newInterruption = new Interruption();
            $newInterruption->start_date            = $holiday->Date;
            $newInterruption->end_date              = $holiday->Date;
            $newInterruption->description           = $holiday->Name;
            $newInterruption->interruption_type_id  = InterruptionType::where('name', InterruptionTypesEnum::HOLIDAYS)->first()->id;
            $newInterruption->calendar_id           = $calendarId;
            $newInterruption->save();
        }
    }


    public static function importCoursesFromWebService(int $academicYearCode, int $semester)
    {
        set_time_limit(0);
        Log::channel('courses_sync')->info('Start "importCoursesFromWebService" sync for Year code (' . $academicYearCode . ') and semester (' . $semester . ')');
        try{
            //validate if the semester is 1 or 2
            if( $semester != 1 && $semester != 2) {
                exit();
            }
            //get AcademicYear Id
            $academicYear = AcademicYear::where('code', $academicYearCode)->firstOrFail();
            $academicYearId = $academicYear->id;
            // get list of schools that have "base_link" data
            $schools = School::whereNotNull('base_link')->get();
            // connect to LDAP server
            $connection = new Connection([
                'hosts'    => [env('LDAP_HOST')],
                'username' => env('LDAP_USERNAME'),
                'password' => env('LDAP_PASSWORD'),
                'version' => 3,
            ]);
            $LdapConnection = $connection->query()->setDn('OU=Funcionarios,dc=ipleiria,dc=pt');

            // Loop for each saved school
            foreach ($schools as $school) {
                $apiEndpoint = "{$school->base_link}?{$school->query_param_academic_year}={$academicYearCode}&{$school->query_param_semester}=S{$semester}";
                $courseUnits = [];

                array_push($courseUnits, ...explode("<br>", mb_convert_encoding(file_get_contents($apiEndpoint), "utf-8", "latin1")));
                // loop for each course unit
                foreach ($courseUnits as $courseUnit) {
                    if (!empty($courseUnit)) {
                        /* split each line. EX:
                         *  2098;Inglês Geral;209807;Inglês C2 ;Ricardo Jaime Silva Pereira(ricardo.pereira);1
                         *  2100;Matemáticas Gerais;210001;Matemática A ;Ana Cristina Felizardo Henriques(ana.f.henriques),Diogo Pedro Ferreira Nascimento Baptista(diogo.baptista),Fátima Maria Marques da Silva(fatima.silva),José Maria Gouveia Martins(jmmartins);1
                         *
                         * $info[] => this will be based on the settings for each school, set on the admin page
                         */
                        $info = explode(";", $courseUnit);
                        // Retrieve Course by code or create it if it doesn't exist...
                        $course = Course::firstOrCreate(
                            ["code" => $info[$school->index_course_code]],
                            [
                                "school_id" => $school->id,
                                "name_pt" => $info[$school->index_course_name],
                                "name_en" => $info[$school->index_course_name] // this will duplicate the value as default, to prevent empty states
                            ]
                        );
                        // https://laravel.com/docs/9.x/eloquent-relationships#syncing-associations
                        $course->academicYears()->syncWithoutDetaching($academicYearId);
                        // Retrieve Branch by course_id or create it if it doesn't exist...
                        $branch = Branch::firstOrCreate(
                            ["course_id" => $course->id],
                            [
                                "name" => "Tronco Comum",
                                "initials" => "TComum"
                            ]
                        );
                        // Retrieve CourseUnit by code or create it if it doesn't exist...
                        $newestCourseUnit = CourseUnit::firstOrCreate(
                            ["code" => $info[$school->index_course_unit_code]],
                            [
                                "course_id" => $course->id,
                                "branch_id" => $branch->id,
                                "semester" => $semester,
                                "curricular_year" => $info[$school->index_course_unit_curricular_year],
                                "name_pt" => $info[$school->index_course_unit_name],
                                "name_en" => $info[$school->index_course_unit_name] // this will duplicate the value as default, to prevent empty states
                            ]
                        );
                        // https://laravel.com/docs/9.x/eloquent-relationships#syncing-associations
                        $newestCourseUnit->academicYears()->syncWithoutDetaching($academicYearId);
                        // split teaches from request
                        // 2100;Matemáticas Gerais;210001;Matemática A ;Ana Cristina Felizardo Henriques(ana.f.henriques),Diogo Pedro Ferreira Nascimento Baptista(diogo.baptista),Fátima Maria Marques da Silva(fatima.silva),José Maria Gouveia Martins(jmmartins);1
                        $teachers = explode(",", $info[$school->index_course_unit_teachers]);
                        $teachersForCourseUnit = [];
                        foreach ($teachers as $teacher) {
                            if (!empty($teacher)) {
                                preg_match('#\((.*?)\)#', $teacher, $match);
                                $username = trim($match[1]);
                                if (!empty($username)) {
                                    //create email from username
                                    $userEmail = "{$username}@ipleiria.pt";
                                    // validate if user already exists on our USERS table
                                    $foundUser = User::where("email", $userEmail)->first();
                                    if (is_null($foundUser)) {
                                        // if the user is not created, it will create a new record for the user.
                                        //$ldapUser = (clone $LdapConnection)->whereContains('mailNickname', $username)->orWhereContains('mail', $userEmail)->first('cn');
                                        $foundUser = User::create([
                                            "email" => $userEmail,
                                            "name" => '',//$ldapUser['cn'][0],
                                            "password" => "",
                                        ]);
                                    }
                                    // https://laravel.com/docs/9.x/eloquent-relationships#syncing-associations
                                    $foundUser->groups()->syncWithoutDetaching(Group::isTeacher()->get());
                                    $teachersForCourseUnit[] = $foundUser->id;
                                }
                            }
                        }
                        // https://laravel.com/docs/9.x/eloquent-relationships#syncing-associations
                        $newestCourseUnit->teachers()->sync($teachersForCourseUnit, true);
                    }
                }
                //get all courses without num_years and update the number
                $courses = Course::whereNull('num_years')->get();
                foreach ($courses as $course) {
                    $course->num_years = $course->courseUnits()->max('curricular_year');
                    $course->save();
                }
            }

            if($semester === 1) {
                $academicYear->s1_sync = Carbon::now();
                $academicYear->save();
            } else if($semester === 2) {
                $academicYear->s2_sync = Carbon::now();
                $academicYear->save();
            }
        }catch(\Exception $e){
            Log::channel('courses_sync')->error('There was an error syncing. ', $e);
        }
        Log::channel('courses_sync')->info('End "importCoursesFromWebService" sync for Year code (' . $academicYearCode . ') and semester (' . $semester . ')');
    }
}
