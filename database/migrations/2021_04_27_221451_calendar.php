<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Calendar extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('schools', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('code')->unique();
            $table->string('name');
            $table->unsignedBigInteger('gop_group_id')->nullable();
            $table->unsignedBigInteger('board_group_id')->nullable();
            $table->unsignedBigInteger('pedagogic_group_id')->nullable();
            $table->foreign('gop_group_id')->references('id')->on('groups');
            $table->foreign('board_group_id')->references('id')->on('groups');
            $table->foreign('pedagogic_group_id')->references('id')->on('groups');
            $table->string('base_link')->nullable();
            $table->string('index_course_code')->nullable();
            $table->string('index_course_name')->nullable();
            $table->string('index_course_unit_name')->nullable();
            $table->string('index_course_unit_curricular_year')->nullable();
            $table->string('index_course_unit_code')->nullable();
            $table->string('index_course_unit_teachers')->nullable();
            $table->string('query_param_academic_year')->nullable();
            $table->string('query_param_semester')->nullable();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('coordinator_user_id')->nullable();
            $table->unsignedBigInteger('school_id');
            $table->string('code');
            $table->string('name');
            $table->string('initials')->nullable();
            $table->integer('degree')->nullable();
            $table->integer('num_years')->nullable();
            $table->foreign('coordinator_user_id')->references('id')->on('users');
            $table->foreign('school_id')->references('id')->on('schools');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('course_id');
            $table->string('name');
            $table->string('initials');
            $table->foreign('course_id')->references('id')->on('courses');
        });

        Schema::create('academic_years', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('code')->unique();
            $table->string('display');
            $table->boolean('active')->default(true);
            $table->softDeletes();
        });

        Schema::create('calendars', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('calendar_phase_id');
            $table->unsignedBigInteger('previous_calendar_id')->nullable();
            $table->unsignedBigInteger('academic_year_id');
            $table->foreign('course_id')->references('id')->on('courses');
            $table->foreign('calendar_phase_id')->references('id')->on('calendar_phases');
            $table->foreign('academic_year_id')->references('id')->on('academic_years');
            $table->integer('semester');
            $table->string('observations')->nullable();
            $table->boolean('temporary')->default(true);
            $table->boolean('published')->default(false);
            $table->json('difference_from_previous_calendar')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
            $table->timestamps();
            $table->softDeletes();
        });


        Schema::table('calendars', function (Blueprint $table) {
            $table->foreign('previous_calendar_id')->references('id')->on('calendars');
        });

        Schema::create('evaluation_types', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('code')->unique();
            $table->string('description');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('epoch_types', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('name');
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('name');
        });

        Schema::create('epoch_type_semester', function (Blueprint $table) {
            $table->unsignedBigInteger('epoch_type_id');
            $table->unsignedBigInteger('semester_id');
            $table->foreign('epoch_type_id')->references('id')->on('epoch_types');
            $table->foreign('semester_id')->references('id')->on('semesters');
        });

        Schema::create('epochs', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('calendar_id');
            $table->unsignedBigInteger('epoch_type_id');
            $table->string('name');
            $table->timestamp('start_date')->useCurrent();
            $table->timestamp('end_date')->useCurrent();
            $table->foreign('calendar_id')->references('id')->on('calendars');
            $table->foreign('epoch_type_id')->references('id')->on('epoch_types');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('methods', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('evaluation_type_id');
            $table->decimal("minimum");
            $table->decimal("weight");
            $table->boolean("enabled")->default(true);
            $table->foreign('evaluation_type_id')->references('id')->on('evaluation_types');
            $table->timestamps();
        });

        Schema::create('epoch_method', function (Blueprint $table) {
            $table->unsignedBigInteger('method_id');
            $table->unsignedBigInteger('epoch_id');
            $table->foreign('method_id')->references('id')->on('methods')->onDelete('cascade');
            $table->foreign('epoch_id')->references('id')->on('epochs');
        });

        Schema::create('course_unit_groups', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('description');
            $table->timestamps();
        });

        Schema::create('course_units', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('responsible_user_id')->nullable();
            $table->unsignedBigInteger('course_unit_group_id')->nullable();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('initials')->nullable();
            $table->integer('curricular_year');
            $table->string('semester');
            $table->foreign('course_id')->references('id')->on('courses');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('set null');
            $table->foreign('responsible_user_id')->references('id')->on('users');
            $table->foreign('course_unit_group_id')->references('id')->on('course_unit_groups')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('course_unit_method', function (Blueprint $table) {
            $table->unsignedBigInteger('course_unit_id');
            $table->unsignedBigInteger('method_id');

            $table->foreign('course_unit_id')->references('id')->on('course_units');
            $table->foreign('method_id')->references('id')->on('methods')->onDelete('cascade');
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('epoch_id');
            $table->unsignedBigInteger('method_id');
            $table->string('room')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->string('hour');
            $table->string('duration_minutes')->nullable();
            $table->string('observations')->nullable();
            $table->foreign('epoch_id')->references('id')->on('epochs');
            $table->foreign('method_id')->references('id')->on('methods')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('interruption_types', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('name');
            $table->string('description');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('interruptions', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('interruption_type_id');
            $table->unsignedBigInteger('calendar_id');
            $table->timestamp('start_date')->useCurrent();
            $table->timestamp('end_date')->useCurrent();
            $table->string('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->foreign('interruption_type_id')->references('id')->on('interruption_types');
            $table->foreign('calendar_id')->references('id')->on('calendars');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('calendar_changes', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('calendar_id');
            $table->unsignedBigInteger('calendar_phase_id');
            $table->string('observations')->nullable();
            $table->boolean('temporary');
            $table->timestamps();
            $table->foreign('calendar_id')->references('id')->on('calendars');
            $table->foreign('calendar_phase_id')->references('id')->on('calendar_phases');
            $table->softDeletes();
        });

        Schema::create('exam_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('user_id');
            $table->string('comment');
            $table->boolean('ignored')->default(false);
            $table->foreign('exam_id')->references('id')->on('exams');
            $table->foreign('user_id')->references('id')->on('users');
            $table->timestamps();
        });

        
        Schema::create('academic_year_course', function (Blueprint $table) {
            $table->unsignedBigInteger('academic_year_id');
            $table->unsignedBigInteger('course_id');
            $table->foreign('academic_year_id')->references('id')->on('academic_years');
            $table->foreign('course_id')->references('id')->on('courses');
        });

        Schema::create('course_user', function (Blueprint $table) {
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('user_id');
            $table->foreign('course_id')->references('id')->on('courses');
            $table->foreign('user_id')->references('id')->on('users');
        });

        Schema::create('course_unit_user', function (Blueprint $table) {
            $table->unsignedBigInteger('course_unit_id');
            $table->unsignedBigInteger('user_id');
            $table->foreign('course_unit_id')->references('id')->on('course_units');
            $table->foreign('user_id')->references('id')->on('users');
        });

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
        //
    }
}
