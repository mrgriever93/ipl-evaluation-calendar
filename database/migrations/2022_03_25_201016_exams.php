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
        Schema::create('exams', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->unsignedBigInteger('epoch_id');
            $table->unsignedBigInteger('method_id');
            $table->string('room')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->string('hour');
            $table->string('duration_minutes')->nullable();
            $table->string('observations_pt')->nullable();
            $table->string('observations_en')->nullable();
            $table->foreign('epoch_id')->references('id')->on('epochs');
            $table->foreign('method_id')->references('id')->on('methods')->onDelete('cascade');

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
        Schema::dropIfExists('exams');
    }
};