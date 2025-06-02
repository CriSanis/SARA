<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ConductorController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\AsociacionController;
use App\Http\Controllers\PedidoController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::put('/conductores/{id}/verificar', [ConductorController::class, 'verificar']);

        Route::get('/vehiculos', [VehiculoController::class, 'index']);
        Route::post('/vehiculos', [VehiculoController::class, 'store']);
        Route::put('/vehiculos/{id}', [VehiculoController::class, 'update']);
        Route::delete('/vehiculos/{id}', [VehiculoController::class, 'destroy']);

        Route::get('/asociaciones', [AsociacionController::class, 'index']);
        Route::post('/asociaciones', [AsociacionController::class, 'store']);
        Route::put('/asociaciones/{id}', [AsociacionController::class, 'update']);
        Route::delete('/asociaciones/{id}', [AsociacionController::class, 'destroy']);
        Route::post('/asociacion-conductores', [AsociacionController::class, 'asignarConductor']);
        Route::delete('/asociacion-conductores/{id}', [AsociacionController::class, 'desasignarConductor']);

        Route::post('/pedido-conductor', [PedidoController::class, 'asignarConductor']);
    });

    Route::middleware(['role:admin|driver|client'])->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/pedidos', [PedidoController::class, 'index']);
        Route::post('/pedidos', [PedidoController::class, 'store'])->middleware('permission:create-pedidos');
        Route::put('/pedidos/{id}', [PedidoController::class, 'update']);
        Route::delete('/pedidos/{id}', [PedidoController::class, 'destroy']);
    });
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');