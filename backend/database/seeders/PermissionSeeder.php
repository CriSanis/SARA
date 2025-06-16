<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles
        $admin = Role::create(['name' => 'admin']);
        $driver = Role::create(['name' => 'driver']);
        $client = Role::create(['name' => 'client']);

        // Definir permisos y sus asignaciones
        $permissions = [
            'create-pedidos' => ['admin', 'client'],
            'view-pedidos' => ['admin', 'driver', 'client'],
            'update-pedidos' => ['admin'],
            'delete-pedidos' => ['admin'],
            'view-notificaciones' => ['admin', 'driver', 'client'],
            'update-seguimientos' => ['driver'],
            'view-seguimientos' => ['admin', 'driver', 'client'],
        ];

        // Crear y asignar permisos
        foreach ($permissions as $permission => $roles) {
            Permission::create(['name' => $permission]);
            foreach ($roles as $role) {
                Role::findByName($role)->givePermissionTo($permission);
            }
        }
    }
}