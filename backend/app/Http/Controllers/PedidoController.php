<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Conductor;
use App\Models\User;
use App\Notifications\PedidoCreado;
use App\Notifications\ConductorAsignado;
use App\Notifications\PedidoEstadoActualizado;
use App\Events\ModelAudited;
use App\Services\RouteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Traits\HasRoles;

class PedidoController extends Controller
{
    use HasRoles;
    
    protected $routeService;

    public function __construct(RouteService $routeService)
    {
        $this->routeService = $routeService;
    }

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $pedidos = Pedido::with(['cliente', 'conductor.user'])->get();
        } elseif ($user->hasRole('driver')) {
            $pedidos = Pedido::with(['cliente', 'conductor.user'])
                ->where('conductor_id', $user->conductor->id)
                ->get();
        } else {
            $pedidos = Pedido::with(['cliente', 'conductor.user'])
                ->where('cliente_id', $user->id)
                ->get();
        }
        return response()->json($pedidos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'origen' => 'required|string|max:255',
            'origen_coordenadas' => 'required|array',
            'origen_coordenadas.lat' => 'required|numeric',
            'origen_coordenadas.lng' => 'required|numeric',
            'destino' => 'required|string|max:255',
            'destino_coordenadas' => 'required|array',
            'destino_coordenadas.lat' => 'required|numeric',
            'destino_coordenadas.lng' => 'required|numeric',
            'descripcion' => 'nullable|string',
        ]);

        // Calcular ruta
        $routeData = $this->routeService->calculateRoute($request->origen_coordenadas, $request->destino_coordenadas);

        $pedido = Pedido::create([
            'cliente_id' => Auth::id(),
            'origen' => $request->origen,
            'origen_coordenadas' => $request->origen_coordenadas,
            'destino' => $request->destino,
            'destino_coordenadas' => $request->destino_coordenadas,
            'distancia_estimada_km' => $routeData['distancia_km'],
            'duracion_estimada_min' => $routeData['duracion_min'],
            'descripcion' => $request->descripcion,
            'estado' => 'pendiente',
        ]);

        // Notificar al cliente y administradores
        $pedido->cliente->notify(new PedidoCreado($pedido));
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new PedidoCreado($pedido));
        }

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'create', $pedido));

        return response()->json($pedido, 201);
    }

    public function update(Request $request, $id)
    {
        try {
            $pedido = Pedido::findOrFail($id);
            $user = Auth::user();

            if ($user->hasRole('client') && $pedido->cliente_id !== $user->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            if ($user->hasRole('driver') && $pedido->conductor_id !== $user->conductor->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $request->validate([
                'origen' => 'sometimes|required|string|max:255',
                'origen_coordenadas' => 'sometimes|required|array',
                'origen_coordenadas.lat' => 'required_with:origen_coordenadas|numeric',
                'origen_coordenadas.lng' => 'required_with:origen_coordenadas|numeric',
                'destino' => 'sometimes|required|string|max:255',
                'destino_coordenadas' => 'sometimes|required|array',
                'destino_coordenadas.lat' => 'required_with:destino_coordenadas|numeric',
                'destino_coordenadas.lng' => 'required_with:destino_coordenadas|numeric',
                'descripcion' => 'nullable|string',
                'estado' => 'sometimes|required|in:pendiente,en_progreso,completado',
            ]);

            $updateData = $request->only([
                'origen', 'origen_coordenadas', 'destino', 'destino_coordenadas',
                'descripcion', 'estado'
            ]);

            if ($request->has('origen_coordenadas') || $request->has('destino_coordenadas')) {
                $origenCoords = $request->origen_coordenadas ?? $pedido->origen_coordenadas;
                $destinoCoords = $request->destino_coordenadas ?? $pedido->destino_coordenadas;

                try {
                    $routeData = $this->routeService->calculateRoute($origenCoords, $destinoCoords);
                    $updateData['distancia_estimada_km'] = $routeData['distancia_km'];
                    $updateData['duracion_estimada_min'] = $routeData['duracion_min'];
                } catch (\Exception $e) {
                    \Log::error('Error al calcular ruta: ' . $e->getMessage());
                    return response()->json(['message' => 'Error al calcular la ruta: ' . $e->getMessage()], 422);
                }
            }

            $estadoAnterior = $pedido->estado;
            
            try {
                $pedido->update($updateData);
            } catch (\Exception $e) {
                \Log::error('Error al actualizar pedido: ' . $e->getMessage());
                return response()->json(['message' => 'Error al actualizar el pedido: ' . $e->getMessage()], 500);
            }

            // Notificar cambio de estado
            if ($request->has('estado') && $estadoAnterior !== $request->estado) {
                try {
                    $pedido->cliente->notify(new PedidoEstadoActualizado($pedido));
                    if ($pedido->conductor) {
                        $pedido->conductor->user->notify(new PedidoEstadoActualizado($pedido));
                    }
                } catch (\Exception $e) {
                    \Log::error('Error al enviar notificaciones: ' . $e->getMessage());
                }
            }

            // Registrar auditoría
            try {
                $changes = array_diff_assoc($updateData, $pedido->getOriginal());
                if ($changes) {
                    event(new ModelAudited(Auth::user(), 'update', $pedido, $changes));
                }
            } catch (\Exception $e) {
                \Log::error('Error al registrar auditoría: ' . $e->getMessage());
            }

            return response()->json($pedido);
        } catch (\Exception $e) {
            \Log::error('Error general en update: ' . $e->getMessage());
            return response()->json(['message' => 'Error del sistema: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $pedido = Pedido::findOrFail($id);
        $user = Auth::user();

        if ($user->hasRole('client') && $pedido->cliente_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'delete', $pedido));

        $pedido->delete();
        return response()->json(null, 204);
    }

    public function asignarConductor(Request $request)
    {
        $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'conductor_id' => 'required|exists:conductores,id',
        ]);

        $pedido = Pedido::findOrFail($request->pedido_id);
        $changes = ['conductor_id' => $request->conductor_id];
        $pedido->update(['conductor_id' => $request->conductor_id]);

        // Notificar al conductor y cliente
        $pedido->conductor->user->notify(new ConductorAsignado($pedido));
        $pedido->cliente->notify(new ConductorAsignado($pedido));

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'assign_conductor', $pedido, $changes));

        return response()->json($pedido);
    }
}