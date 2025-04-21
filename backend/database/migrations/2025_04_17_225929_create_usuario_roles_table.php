<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/YYYY_MM_DD_create_usuario_roles_table.php
    //  se mejora el tema de los roles para la base de datos porque estaba fallando toda la explicacion en SARA SOL1
    public function up()
{
    Schema::create('usuario_roles', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('role_id')->constrained()->cascadeOnDelete();
        $table->primary(['user_id', 'role_id']);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('usuario_roles');
    }
};