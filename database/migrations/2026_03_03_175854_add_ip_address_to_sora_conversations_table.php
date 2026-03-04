<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sora_conversations', function (Blueprint $table) {
            // IPv6 puede tener hasta 45 caracteres
            $table->string('ip_address', 45)->nullable()->after('session_id');
        });
    }

    public function down(): void
    {
        Schema::table('sora_conversations', function (Blueprint $table) {
            $table->dropColumn('ip_address');
        });
    }
};
