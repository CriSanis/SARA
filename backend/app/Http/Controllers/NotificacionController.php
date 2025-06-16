<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notificacion;

class NotificacionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notificaciones = Notificacion::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notificaciones);
    }

    public function marcarComoLeida($id)
    {
        $notificacion = Notificacion::findOrFail($id);
        
        if ($notificacion->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notificacion->update(['leida' => true]);
        return response()->json($notificacion);
    }

    public function marcarTodasComoLeidas()
    {
        Notificacion::where('user_id', Auth::id())
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }
} 