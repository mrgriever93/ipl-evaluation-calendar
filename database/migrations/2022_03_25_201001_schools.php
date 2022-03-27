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
        Schema::dropIfExists('schools');
    }
};
