<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->decimal('distancia_estimada_km', 10, 2)->nullable()->after('destino');
            $table->integer('duracion_estimada_min')->nullable()->after('distancia_estimada_km');
            $table->json('origen_coordenadas')->nullable()->after('origen');
            $table->json('destino_coordenadas')->nullable()->after('destino');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['distancia_estimada_km', 'duracion_estimada_min', 'origen_coordenadas', 'destino_coordenadas']);
        });
    }
};