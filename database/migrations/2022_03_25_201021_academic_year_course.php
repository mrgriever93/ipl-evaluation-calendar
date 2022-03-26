<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('academic_year_course', function (Blueprint $table) {
            $table->unsignedBigInteger('academic_year_id');
            $table->unsignedBigInteger('course_id');
            $table->foreign('academic_year_id')->references('id')->on('academic_years');
            $table->foreign('course_id')->references('id')->on('courses');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('academic_year_course');
    }
};
