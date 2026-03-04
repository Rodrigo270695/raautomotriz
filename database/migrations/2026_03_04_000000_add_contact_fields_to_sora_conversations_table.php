<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sora_conversations', function (Blueprint $table) {
            $table->string('guest_name', 150)->nullable()->after('user_id');
            $table->string('guest_phone', 30)->nullable()->after('guest_name');
            $table->string('vehicle_brand', 100)->nullable()->after('vehicle_plate');
            $table->string('vehicle_model', 100)->nullable()->after('vehicle_brand');
        });
    }

    public function down(): void
    {
        Schema::table('sora_conversations', function (Blueprint $table) {
            $table->dropColumn([
                'guest_name',
                'guest_phone',
                'vehicle_brand',
                'vehicle_model',
            ]);
        });
    }
};

