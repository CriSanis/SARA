<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('set null');
            $table->string('action'); // Ejemplo: create, update, delete
            $table->string('model_type'); // Ejemplo: App\Models\Pedido
            $table->unsignedBigInteger('model_id'); // ID del modelo afectado
            $table->json('changes')->nullable(); // Cambios realizados (antes/dpués)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audits');
    }
};