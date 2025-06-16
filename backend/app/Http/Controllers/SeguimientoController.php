<?php

namespace App\Http\Controllers;

use App\Models\Seguimiento;
use App\Models\Pedido;
use App\Events\SeguimientoActualizado;
use App\Events\ModelAudited;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Schema(
 *     schema="Seguimiento",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="pedido_id", type="integer"),
 *     @OA\Property(property="ubicacion_actual", type="object", example={"lat": -16.5, "lng": -68.15}),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Tag(
 *     name="Seguimientos",
 *     description="Operaciones para gestionar seguimientos en tiempo real"
 * )
 */
class SeguimientoController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/seguimientos",
     *     summary="Actualizar ubicación de un pedido",
     *     tags={"Seguimientos"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="pedido_id", type="integer"),
     *             @OA\Property(property="latitud", type="number"),
     *             @OA\Property(property="longitud", type="number")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Seguimiento creado",
     *         @OA\JsonContent(ref="#/components/schemas/Seguimiento")
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        $user = Auth::user();
        $pedido = Pedido::findOrFail($request->pedido_id);

        if (!$user->hasRole('driver') || $pedido->conductor_id !== $user->conductor->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $ubicacion = json_encode([
            'lat' => $request->latitud,
            'lng' => $request->longitud
        ]);

        $seguimiento = Seguimiento::create([
            'pedido_id' => $request->pedido_id,
            'ubicacion_actual' => $ubicacion,
        ]);

        // Disparar evento de WebSocket
        event(new SeguimientoActualizado($seguimiento));

        // Registrar auditoría
        event(new ModelAudited($user, 'create_seguimiento', $pedido, [
            'ubicacion_actual' => $ubicacion,
        ]));

        return response()->json($seguimiento, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/seguimientos/{pedido_id}",
     *     summary="Listar seguimientos de un pedido",
     *     tags={"Seguimientos"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="pedido_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de seguimientos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Seguimiento")
     *         )
     *     )
     * )
     */
    public function index($pedido_id)
    {
        $user = Auth::user();
        $pedido = Pedido::findOrFail($pedido_id);

        if (!$user->hasRole('admin') && $pedido->cliente_id !== $user->id && (!$pedido->conductor || $pedido->conductor->user_id !== $user->id)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $seguimientos = Seguimiento::where('pedido_id', $pedido_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($seguimientos);
    }
}