<?php

namespace App\Providers;

use App\Calendar;
use App\Policies\CalendarPolicy;
use Carbon\Carbon;
use Laravel\Passport\Passport;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Calendar::class => CalendarPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
        Passport::tokensExpireIn(Carbon::now()->addDays(5));
        Passport::tokensCan([
            'create_calendar' => '',
            'delete_calendar' => '',
            'view_calendar_info' => '',
            'view_comments' => '',
            'view_calendar_history' => '',
            'view_actual_phase' => '',
            'create_course_units' => '',
            'edit_course_units' => '',
            'delete_course_units' => '',
            'edit_user_groups' => '',
            'delete_user_groups' => '',
            'create_user_groups' => '',
            'edit_users' => '',
            'lock_users' => '',
            'create_evaluation_types' => '',
            'edit_evaluation_types' => '',
            'delete_evaluation_types' => '',
            'create_interruption_types' => '',
            'edit_interruption_types' => '',
            'delete_interruption_types' => '',
            'create_calendar_phases' => '',
            'edit_calendar_phases' => '',
            'delete_calendar_phases' => '',
            'create_languages' => '',
            'edit_languages' => '',
            'translate' => '',
            'create_schools' => '',
            'edit_schools' => '',
            'create_academic_years' => '',
            'edit_academic_years' => '',
            'delete_academic_years' => '',
            'change_permissions' => '',
            'create_courses' => '',
            'edit_courses' => '',
            'delete_courses' => '',
            'add_comments' => '',
            'change_calendar_phase' => '',
            'add_exams' => '',
            'edit_exams' => '',
            'remove_exams' => '',
            'add_interruption' => '',
            'edit_interruption' => '',
            'remove_interruption' => '',
            'publish_calendar' => '',
            'create_copy' => '',
            'manage_evaluation_methods' => '',
            "define_course_coordinator" => '',
            "define_course_unit_responsible" => '',
            'view_course_units' => '',
            'define_course_unit_teachers' => '',
        ]);

        Passport::routes();
    }
}
