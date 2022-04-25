<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class YearsAndCoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $academicYears = [
            [ "code" => "202122", "display" => "2021-22", "active" => 1, "selected" => 1 ],
            [ "code" => "202223", "display" => "2022-23", "active" => 1, "selected" => 0 ],
        ];

        foreach ($academicYears as $year) {
            $newYear = new AcademicYear($year);
            $newYear->save();
        }
    }
}
