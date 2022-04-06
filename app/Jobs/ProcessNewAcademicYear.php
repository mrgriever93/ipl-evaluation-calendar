<?php

namespace App\Jobs;

use App\Services\ExternalImports;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessNewAcademicYear implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $academicYearCode;
    protected $semester;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $academicYearCode, int $semester)
    {
        $this->academicYearCode = $academicYearCode;
        $this->semester = $semester;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        ExternalImports::importCoursesFromWebService($this->academicYearCode, $this->semester);
    }
}
