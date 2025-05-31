<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles con el guard 'sanctum' para API
        $admin = Role::create(['name' => 'admin', 'guard_name' => 'sanctum']);
        $driver = Role::create(['name' => 'driver', 'guard_name' => 'sanctum']);
        $client = Role::create(['name' => 'client', 'guard_name' => 'sanctum']);

        // Crear permisos con el guard 'sanctum' para API
        Permission::create(['name' => 'manage_users', 'guard_name' => 'sanctum']); // Admin: Gestionar usuarios
        Permission::create(['name' => 'manage_vehicles', 'guard_name' => 'sanctum']); // Admin/Driver: Gestionar vehículos
        Permission::create(['name' => 'create_orders', 'guard_name' => 'sanctum']); // Client: Crear pedidos
        Permission::create(['name' => 'view_orders', 'guard_name' => 'sanctum']); // Client/Driver: Ver pedidos
        Permission::create(['name' => 'manage_associations', 'guard_name' => 'sanctum']); // Admin: Gestionar asociaciones

        // Asignar permisos a roles
        $admin->syncPermissions([
            'manage_users',
            'manage_vehicles',
            'view_orders',
            'manage_associations',
        ]);
        $driver->syncPermissions(['manage_vehicles', 'view_orders']);
        $client->syncPermissions(['create_orders', 'view_orders']);
    }
}