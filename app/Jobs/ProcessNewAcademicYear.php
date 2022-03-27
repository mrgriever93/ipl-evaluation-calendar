<?php

namespace App\Jobs;

use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessNewAcademicYear implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $academicYear;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(AcademicYear $academicYear)
    {
        $this->academicYear = $academicYear;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Course::importCoursesFromWebService($this->academicYear->code);
    }
}
