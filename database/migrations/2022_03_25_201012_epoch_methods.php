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
        Schema::create('epoch_method', function (Blueprint $table) {
            $table->unsignedBigInteger('method_id');
            $table->unsignedBigInteger('epoch_id');
            $table->foreign('method_id')->references('id')->on('methods')->onDelete('cascade');
            $table->foreign('epoch_id')->references('id')->on('epochs');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('epoch_method');
    }
};
