<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('pedido.{pedidoId}', function ($user, $pedidoId) {
    // Verificar si el usuario tiene permiso para ver el seguimiento del pedido
    return $user->hasPermissionTo('view-seguimientos');
}); 