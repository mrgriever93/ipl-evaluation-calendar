<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (Schema::hasTable('users')) {
            return false;
        }
        Schema::table('users', function (Blueprint $table) {
            $table->string('guid')->unique()->nullable();
            $table->string('domain')->nullable();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['guid', 'domain']);
        });
    }
};