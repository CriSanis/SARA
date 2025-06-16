<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Vehiculo;
use App\Models\Asociacion;
use App\Models\Pedido;
use App\Models\Ruta;
use App\Models\Seguimiento;
use Illuminate\Support\Facades\Hash;

class TransporteSeeder extends Seeder
{
    public function run(): void
    {
        // Crear usuario administrador
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'admin'
        ]);
        $admin->assignRole('admin');

        // Crear usuario conductor
        $conductor = User::create([
            'name' => 'Conductor',
            'email' => 'conductor@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'driver'
        ]);
        $conductor->assignRole('driver');

        // Crear conductor
        $conductorModel = Conductor::create([
            'user_id' => $conductor->id,
            'licencia' => 'LIC123',
            'estado_verificacion' => 'verificado'
        ]);

        // Crear vehículo
        $vehiculo = Vehiculo::create([
            'conductor_id' => $conductorModel->id,
            'placa' => 'ABC123',
            'modelo' => 'Toyota',
            'marca' => 'Corolla',
            'capacidad' => 1000
        ]);

        // Crear asociación
        $asociacion = Asociacion::create([
            'nombre' => 'Asociación de Transporte',
            'direccion' => 'Calle Principal 123',
            'telefono' => '123456789',
            'email' => 'asociacion@example.com'
        ]);

        // Asignar conductor a asociación
        $asociacion->conductores()->attach($conductorModel->id);

        // Crear pedido de prueba
        Pedido::create([
            'cliente_id' => $admin->id,
            'conductor_id' => $conductorModel->id,
            'descripcion' => 'Pedido de prueba',
            'estado' => 'pendiente',
            'fecha_entrega' => now()->addDays(2),
            'direccion_origen' => 'Av. Principal 123, Ciudad A',
            'direccion_destino' => 'Calle Secundaria 456, Ciudad B',
            'peso' => 500,
            'valor_asegurado' => 1000,
            'origen_lat' => -16.5,
            'origen_lng' => -68.15,
            'destino_lat' => -16.6,
            'destino_lng' => -68.2,
            'imagenes' => null
        ]);
    }
}