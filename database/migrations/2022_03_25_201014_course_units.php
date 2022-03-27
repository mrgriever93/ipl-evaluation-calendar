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
        Schema::create('course_units', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('responsible_user_id')->nullable();
            $table->unsignedBigInteger('course_unit_group_id')->nullable();
            $table->string('code')->unique();
            $table->string('name_pt');
            $table->string('name_en');
            $table->string('initials')->nullable();
            $table->integer('curricular_year');
            $table->string('semester');
            $table->foreign('course_id')->references('id')->on('courses');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('set null');
            $table->foreign('responsible_user_id')->references('id')->on('users');
            $table->foreign('course_unit_group_id')->references('id')->on('course_unit_groups')->onDelete('set null');

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('course_units');
    }
};
