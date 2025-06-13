<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Conductor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Mail\ConductorAsignado;
use Illuminate\Support\Facades\Mail;
use App\Events\ModelAudited;

/**
 * @OA\Tag(
 *     name="Pedidos",
 *     description="Operaciones para gestionar pedidos"
 * )
 */
class PedidoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/pedidos",
     *     summary="Listar pedidos",
     *     tags={"Pedidos"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de pedidos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="cliente_id", type="integer"),
     *                 @OA\Property(property="conductor_id", type="integer", nullable=true),
     *                 @OA\Property(property="origen", type="string"),
     *                 @OA\Property(property="destino", type="string"),
     *                 @OA\Property(property="descripcion", type="string", nullable=true),
     *                 @OA\Property(property="estado", type="string")
     *             )
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/pedidos",
     *     summary="Crear un nuevo pedido",
     *     tags={"Pedidos"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"origen","destino"},
     *             @OA\Property(property="origen", type="string", example="Ciudad A"),
     *             @OA\Property(property="destino", type="string", example="Ciudad B"),
     *             @OA\Property(property="descripcion", type="string", example="Carga de 2 toneladas", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Pedido creado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="cliente_id", type="integer"),
     *             @OA\Property(property="origen", type="string"),
     *             @OA\Property(property="destino", type="string"),
     *             @OA\Property(property="descripcion", type="string", nullable=true),
     *             @OA\Property(property="estado", type="string")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'origen' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'required|string',
        ]);

        $pedido = Pedido::create([
            'cliente_id' => Auth::id(),
            'origen' => $request->origen,
            'destino' => $request->destino,
            'descripcion' => $request->descripcion,
            'estado' => 'pendiente',
        ]);

        event(new ModelAudited(Auth::user(), 'create', $pedido));

        return response()->json($pedido, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/pedidos/{id}",
     *     summary="Actualizar un pedido",
     *     tags={"Pedidos"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="origen", type="string", example="Ciudad A"),
     *             @OA\Property(property="destino", type="string", example="Ciudad B"),
     *             @OA\Property(property="descripcion", type="string", example="Carga de 2 toneladas", nullable=true),
     *             @OA\Property(property="estado", type="string", enum={"pendiente","en_progreso","completado"}, example="en_progreso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pedido actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="cliente_id", type="integer"),
     *             @OA\Property(property="origen", type="string"),
     *             @OA\Property(property="destino", type="string"),
     *             @OA\Property(property="descripcion", type="string", nullable=true),
     *             @OA\Property(property="estado", type="string")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        
        // Validar que el usuario tenga permiso para actualizar
        if (Auth::user()->hasRole('client') && $pedido->cliente_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'estado' => 'sometimes|required|in:pendiente,en_progreso,completado',
            'origen' => 'sometimes|required|string|max:255',
            'destino' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string',
        ]);

        $pedido->update($request->all());

        event(new ModelAudited(Auth::user(), 'update', $pedido));

        return response()->json($pedido);
    }

    /**
     * @OA\Delete(
     *     path="/api/pedidos/{id}",
     *     summary="Eliminar un pedido",
     *     tags={"Pedidos"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Pedido eliminado"
     *     )
     * )
     */
    public function destroy($id)
    {
        $pedido = Pedido::findOrFail($id);
        
        // Validar que el usuario tenga permiso para eliminar
        if (Auth::user()->hasRole('client') && $pedido->cliente_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $pedido->delete();

        event(new ModelAudited(Auth::user(), 'delete', $pedido));

        return response()->json(null, 204);
    }

    /**
     * @OA\Post(
     *     path="/api/pedido-conductor",
     *     summary="Asignar conductor a un pedido",
     *     tags={"Pedidos"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"pedido_id","conductor_id"},
     *             @OA\Property(property="pedido_id", type="integer", example=1),
     *             @OA\Property(property="conductor_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Conductor asignado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="cliente_id", type="integer"),
     *             @OA\Property(property="conductor_id", type="integer"),
     *             @OA\Property(property="origen", type="string"),
     *             @OA\Property(property="destino", type="string"),
     *             @OA\Property(property="estado", type="string")
     *         )
     *     )
     * )
     */
    public function asignarConductor(Request $request)
    {
        $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'conductor_id' => 'required|exists:conductores,id',
        ]);

        $pedido = Pedido::findOrFail($request->pedido_id);
        $pedido->update(['conductor_id' => $request->conductor_id]);

        event(new ModelAudited(Auth::user(), 'assign_conductor', $pedido));

        return response()->json($pedido);
    }
} 