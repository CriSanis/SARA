<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users');
            $table->foreignId('conductor_id')->nullable()->constrained('conductores');
            $table->enum('estado', ['pendiente', 'en_progreso', 'completado', 'cancelado'])->default('pendiente');
            $table->dateTime('fecha_entrega')->nullable();
            $table->string('direccion_origen');
            $table->string('direccion_destino');
            $table->text('descripcion');
            $table->decimal('peso', 10, 2);
            $table->json('imagenes')->nullable();
            $table->decimal('valor_asegurado', 10, 2);
            $table->decimal('origen_lat', 10, 8);
            $table->decimal('origen_lng', 11, 8);
            $table->decimal('destino_lat', 10, 8);
            $table->decimal('destino_lng', 11, 8);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pedidos');
    }
}; 