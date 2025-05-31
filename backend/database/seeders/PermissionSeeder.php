<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Crear permisos
        $permissions = [
            'create-pedidos',
            'view-pedidos',
            'view-asignaciones',
            'update-pedidos',
            'manage-users',
            'verify-conductores',
            'manage-asociaciones',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles y asignar permisos
        $adminRole = Role::create(['name' => 'admin']);
        $driverRole = Role::create(['name' => 'driver']);
        $clientRole = Role::create(['name' => 'client']);

        // Asignar permisos a roles
        $adminRole->syncPermissions($permissions); // Admin tiene todos los permisos
        $driverRole->syncPermissions(['view-asignaciones', 'update-pedidos']);
        $clientRole->syncPermissions(['create-pedidos', 'view-pedidos']);
    }
}