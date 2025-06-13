<?php

namespace App\Http\Controllers;

use App\Models\Ruta;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\ModelAudited;

/**
 * @OA\Tag(
 *     name="Rutas",
 *     description="Operaciones para gestionar rutas"
 * )
 */
class RutaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/rutas",
     *     summary="Listar rutas",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de rutas",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="nombre", type="string"),
     *                 @OA\Property(property="origen", type="string"),
     *                 @OA\Property(property="destino", type="string"),
     *                 @OA\Property(property="distancia_km", type="number"),
     *                 @OA\Property(property="duracion_estimada_min", type="integer")
     *             )
     *         )
     *     )
     * )
     */
   public function index()
{
    $user = Auth::user();
    if ($user->hasRole('admin')) {
        $rutas = Ruta::with(['pedidos' => function ($query) {
            $query->withPivot('id');
        }])->get();
    } else {
        $rutas = Ruta::whereHas('pedidos', function ($query) use ($user) {
            $query->where('conductor_id', $user->conductor->id);
        })->with(['pedidos' => function ($query) {
            $query->withPivot('id');
        }])->get();
    }
    return response()->json($rutas);
}

    /**
     * @OA\Post(
     *     path="/api/rutas",
     *     summary="Crear una nueva ruta",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre","origen","destino","distancia_km","duracion_estimada_min"},
     *             @OA\Property(property="nombre", type="string", example="Ruta Norte"),
     *             @OA\Property(property="origen", type="string", example="Ciudad A"),
     *             @OA\Property(property="destino", type="string", example="Ciudad B"),
     *             @OA\Property(property="distancia_km", type="number", example=150.5),
     *             @OA\Property(property="duracion_estimada_min", type="integer", example=120)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Ruta creada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="origen", type="string"),
     *             @OA\Property(property="destino", type="string"),
     *             @OA\Property(property="distancia_km", type="number"),
     *             @OA\Property(property="duracion_estimada_min", type="integer")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:rutas',
            'origen' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'distancia_km' => 'required|numeric|min:0.1',
            'duracion_estimada_min' => 'required|integer|min:1',
        ]);

        $ruta = Ruta::create($request->all());
        
        event(new ModelAudited(Auth::user(), 'create', $ruta));
        
        return response()->json($ruta, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/rutas/{id}",
     *     summary="Actualizar una ruta",
     *     tags={"Rutas"},
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
     *             required={"nombre","origen","destino","distancia_km","duracion_estimada_min"},
     *             @OA\Property(property="nombre", type="string", example="Ruta Norte"),
     *             @OA\Property(property="origen", type="string", example="Ciudad A"),
     *             @OA\Property(property="destino", type="string", example="Ciudad B"),
     *             @OA\Property(property="distancia_km", type="number", example=150.5),
     *             @OA\Property(property="duracion_estimada_min", type="integer", example=120)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ruta actualizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="origen", type="string"),
     *             @OA\Property(property="destino", type="string"),
     *             @OA\Property(property="distancia_km", type="number"),
     *             @OA\Property(property="duracion_estimada_min", type="integer")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $ruta = Ruta::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:rutas,nombre,' . $id,
            'origen' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'distancia_km' => 'required|numeric|min:0.1',
            'duracion_estimada_min' => 'required|integer|min:1',
        ]);

        $ruta->update($request->all());
        
        event(new ModelAudited(Auth::user(), 'update', $ruta));
        
        return response()->json($ruta);
    }

    /**
     * @OA\Delete(
     *     path="/api/rutas/{id}",
     *     summary="Eliminar una ruta",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Ruta eliminada"
     *     )
     * )
     */
    public function destroy($id)
    {
        $ruta = Ruta::findOrFail($id);
        $ruta->delete();
        
        event(new ModelAudited(Auth::user(), 'delete', $ruta));
        
        return response()->json(null, 204);
    }

    /**
     * @OA\Post(
     *     path="/api/pedido-ruta",
     *     summary="Asignar ruta a un pedido",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"pedido_id","ruta_id"},
     *             @OA\Property(property="pedido_id", type="integer", example=1),
     *             @OA\Property(property="ruta_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Ruta asignada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="pedido_id", type="integer"),
     *             @OA\Property(property="ruta_id", type="integer")
     *         )
     *     )
     * )
     */
    public function asignarRuta(Request $request)
    {
        $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'ruta_id' => 'required|exists:rutas,id',
        ]);

        $exists = \DB::table('pedido_ruta')
            ->where('pedido_id', $request->pedido_id)
            ->where('ruta_id', $request->ruta_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ruta ya asignada a este pedido'], 422);
        }

        $asignacion = \DB::table('pedido_ruta')->insertGetId([
            'pedido_id' => $request->pedido_id,
            'ruta_id' => $request->ruta_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pedido = Pedido::find($request->pedido_id);
        event(new ModelAudited(Auth::user(), 'assign_ruta', $pedido));

        return response()->json(['id' => $asignacion, 'pedido_id' => $request->pedido_id, 'ruta_id' => $request->ruta_id], 201);
    }

    /**
     * @OA\Delete(
     *     path="/api/pedido-ruta/{id}",
     *     summary="Desasignar ruta de un pedido",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Ruta desasignada"
     *     )
     * )
     */
    public function desasignarRuta($id)
    {
        $deleted = \DB::table('pedido_ruta')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Asignación no encontrada'], 404);
        }
        return response()->json(null, 204);
    }
}