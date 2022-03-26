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
        Schema::create('academic_year_course_unit', function (Blueprint $table) {
            $table->unsignedBigInteger('course_unit_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->foreign('course_unit_id')->references('id')->on('course_units');
            $table->foreign('academic_year_id')->references('id')->on('academic_years');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('academic_year_course_unit');
    }
};
