<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Conductor;
use App\Models\User;
use App\Notifications\PedidoCreado;
use App\Notifications\ConductorAsignado;
use App\Notifications\PedidoEstadoActualizado;
use App\Events\ModelAudited;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\AdminAuthorization;

class PedidoController extends Controller
{
    use HasRoles, AdminAuthorization;
    
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Pedido::with(['cliente', 'conductor']);

        if ($user->hasRole('admin')) {
            $pedidos = $query->get();
        } elseif ($user->hasRole('driver')) {
            $pedidos = $query->whereHas('conductor', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->get();
        } else {
            $pedidos = $query->where('cliente_id', $user->id)->get();
        }

        return response()->json($pedidos);
    }

    public function store(Request $request)
    {
        if (!$request->user()->can('create-pedidos')) {
            return response()->json(['message' => 'No tienes permiso para crear pedidos'], 403);
        }

        $request->validate([
            'cliente_id' => 'required|exists:users,id',
            'conductor_id' => 'nullable|exists:conductores,id',
            'estado' => 'required|in:pendiente,en_progreso,completado,cancelado',
            'fecha_entrega' => 'nullable|date',
            'direccion_origen' => 'required|string',
            'direccion_destino' => 'required|string',
            'descripcion' => 'required|string',
            'peso' => 'required|numeric|min:0',
            'imagenes' => 'nullable|array',
            'imagenes.*' => 'nullable|image|max:2048',
            'valor_asegurado' => 'required|numeric|min:0',
            'origen_lat' => 'required|numeric',
            'origen_lng' => 'required|numeric',
            'destino_lat' => 'required|numeric',
            'destino_lng' => 'required|numeric'
        ]);

        $pedido = new Pedido();
        $pedido->cliente_id = $request->cliente_id;
        $pedido->conductor_id = $request->conductor_id;
        $pedido->estado = $request->estado;
        $pedido->fecha_entrega = $request->fecha_entrega;
        $pedido->direccion_origen = $request->direccion_origen;
        $pedido->direccion_destino = $request->direccion_destino;
        $pedido->descripcion = $request->descripcion;
        $pedido->peso = $request->peso;
        $pedido->valor_asegurado = $request->valor_asegurado;
        $pedido->origen_lat = $request->origen_lat;
        $pedido->origen_lng = $request->origen_lng;
        $pedido->destino_lat = $request->destino_lat;
        $pedido->destino_lng = $request->destino_lng;

        // Manejar imágenes si se proporcionan
        if ($request->hasFile('imagenes')) {
            $imagenes = [];
            foreach ($request->file('imagenes') as $imagen) {
                $path = $imagen->store('pedidos', 'public');
                $imagenes[] = $path;
            }
            $pedido->imagenes = $imagenes;
        }

        $pedido->save();

        // Notificar al cliente
        $cliente = User::find($request->cliente_id);
        $cliente->notify(new PedidoCreado($pedido));

        return response()->json($pedido, 201);
    }

    public function show(Request $request, $id)
    {
        if (!$request->user()->can('view-pedidos')) {
            return response()->json(['message' => 'No tienes permiso para ver pedidos'], 403);
        }

        $pedido = Pedido::with(['cliente', 'conductor'])->findOrFail($id);
        return response()->json($pedido);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->can('update-pedidos')) {
            return response()->json(['message' => 'No tienes permiso para actualizar pedidos'], 403);
        }

        $pedido = Pedido::findOrFail($id);
        $oldData = $pedido->toArray();

        $request->validate([
            'cliente_id' => 'sometimes|exists:users,id',
            'conductor_id' => 'nullable|exists:conductores,id',
            'estado' => 'sometimes|in:pendiente,en_progreso,completado,cancelado',
            'fecha_entrega' => 'nullable|date',
            'direccion_origen' => 'sometimes|string',
            'direccion_destino' => 'sometimes|string',
            'descripcion' => 'sometimes|string',
            'peso' => 'sometimes|numeric|min:0',
            'imagenes' => 'nullable|array',
            'imagenes.*' => 'nullable|image|max:2048',
            'valor_asegurado' => 'sometimes|numeric|min:0',
            'origen_lat' => 'sometimes|numeric',
            'origen_lng' => 'sometimes|numeric',
            'destino_lat' => 'sometimes|numeric',
            'destino_lng' => 'sometimes|numeric'
        ]);

        // Actualizar solo los campos que se envían
        $updateData = $request->only([
            'cliente_id',
            'conductor_id',
            'estado',
            'fecha_entrega',
            'direccion_origen',
            'direccion_destino',
            'descripcion',
            'peso',
            'valor_asegurado',
            'origen_lat',
            'origen_lng',
            'destino_lat',
            'destino_lng'
        ]);

        // Actualizar datos básicos
        $pedido->fill($updateData);

        // Manejar imágenes si se proporcionan
        if ($request->hasFile('imagenes')) {
            $imagenes = [];
            foreach ($request->file('imagenes') as $imagen) {
                $path = $imagen->store('pedidos', 'public');
                $imagenes[] = $path;
            }
            $pedido->imagenes = $imagenes;
        }

        $pedido->save();

        // Registrar cambios para auditoría
        $changes = array_diff_assoc($pedido->toArray(), $oldData);
        if (!empty($changes)) {
            event(new ModelAudited(Auth::user(), 'update', $pedido, $changes));
        }

        // Notificar cambios de estado
        if (isset($changes['estado'])) {
            $pedido->cliente->notify(new PedidoEstadoActualizado($pedido, $oldData['estado']));
            if ($pedido->conductor) {
                $pedido->conductor->user->notify(new PedidoEstadoActualizado($pedido, $oldData['estado']));
            }
        }

        // Notificar cambio de conductor si ocurrió
        if (isset($changes['conductor_id'])) {
            if ($pedido->conductor) {
                $pedido->conductor->user->notify(new ConductorAsignado($pedido, $oldData['conductor_id']));
            }
            $pedido->cliente->notify(new ConductorAsignado($pedido, $oldData['conductor_id']));
        }

        return response()->json($pedido);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->can('delete-pedidos')) {
            return response()->json(['message' => 'No tienes permiso para eliminar pedidos'], 403);
        }

        $pedido = Pedido::findOrFail($id);
        $this->auditAction('delete', $pedido);
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