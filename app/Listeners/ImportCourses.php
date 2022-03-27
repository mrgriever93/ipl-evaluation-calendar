<?php

namespace App\Listeners;

use App\Models\Course;
use App\Events\AcademicYearRegistered;

class ImportCourses
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  AcademicYearRegistered  $event
     * @return void
     */
    public function handle(AcademicYearRegistered $event)
    {
        Course::importCoursesFromWebService($event->academicYear->code);
    }
}
