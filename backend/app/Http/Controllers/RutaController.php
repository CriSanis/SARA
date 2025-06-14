<?php

namespace App\Http\Controllers;

use App\Models\Ruta;
use App\Models\Pedido;
use App\Notifications\RutaAsignada;
use App\Events\ModelAudited;
use App\Services\RouteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RutaController extends Controller
{
    protected $routeService;

    public function __construct(RouteService $routeService)
    {
        $this->routeService = $routeService;
    }

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $rutas = Ruta::with('pedidos')->get();
        } else {
            $rutas = Ruta::whereHas('pedidos', function ($query) use ($user) {
                $query->where('conductor_id', $user->conductor->id);
            })->with('pedidos')->get();
        }
        return response()->json($rutas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'origen_coordenadas' => 'required|json',
            'destino_coordenadas' => 'required|json'
        ]);

        $origenCoords = json_decode($request->origen_coordenadas, true);
        $destinoCoords = json_decode($request->destino_coordenadas, true);

        $coordenadas = [
            'type' => 'LineString',
            'coordinates' => [
                [$origenCoords['lng'], $origenCoords['lat']],
                [$destinoCoords['lng'], $destinoCoords['lat']]
            ]
        ];

        $ruta = Ruta::create([
            'nombre' => $request->nombre,
            'coordenadas' => json_encode($coordenadas)
        ]);

        return response()->json($ruta, 201);
    }

    public function update(Request $request, $id)
    {
        $ruta = Ruta::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:rutas,nombre,' . $id,
            'origen' => 'required|string|max:255',
            'origen_coordenadas' => 'required|json',
            'destino' => 'required|string|max:255',
            'destino_coordenadas' => 'required|json',
            'distancia_km' => 'required|numeric|min:0.1',
            'duracion_estimada_min' => 'required|integer|min:1',
        ]);

        $origenCoords = json_decode($request->origen_coordenadas, true);
        $destinoCoords = json_decode($request->destino_coordenadas, true);

        if (!isset($origenCoords['lat'], $origenCoords['lng'], $destinoCoords['lat'], $destinoCoords['lng'])) {
            return response()->json(['message' => 'Coordenadas inválidas'], 422);
        }

        // Calcular coordenadas GeoJSON
        $routeData = $this->routeService->calculateRoute($origenCoords, $destinoCoords);

        $changes = array_diff_assoc(
            array_merge($request->all(), ['coordenadas' => $routeData['coordenadas']]),
            $ruta->toArray()
        );

        $ruta->update([
            'nombre' => $request->nombre,
            'origen' => $request->origen,
            'destino' => $request->destino,
            'coordenadas' => $routeData['coordenadas'],
            'distancia_km' => $routeData['distancia_km'],
            'duracion_estimada_min' => $routeData['duracion_min'],
        ]);

        // Registrar auditoría
        if ($changes) {
            event(new ModelAudited(Auth::user(), 'update', $ruta, $changes));
        }

        return response()->json($ruta);
    }

    public function destroy($id)
    {
        $ruta = Ruta::findOrFail($id);

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'delete', $ruta));

        $ruta->delete();
        return response()->json(null, 204);
    }

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

        // Notificar al conductor asignado
        $pedido = Pedido::find($request->pedido_id);
        $ruta = Ruta::find($request->ruta_id);
        if ($pedido->conductor) {
            $pedido->conductor->user->notify(new RutaAsignada($pedido, $ruta));
        }

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'assign_ruta', $pedido, [
            'ruta_id' => $request->ruta_id,
        ]));

        return response()->json(['id' => $asignacion, 'pedido_id' => $request->pedido_id, 'ruta_id' => $request->ruta_id], 201);
    }

    public function desasignarRuta($id)
    {
        $asignacion = \DB::table('pedido_ruta')->where('id', $id)->first();
        if (!$asignacion) {
            return response()->json(['message' => 'Asignación no encontrada'], 404);
        }

        $pedido = Pedido::find($asignacion->pedido_id);

        // Registrar auditoría
        event(new ModelAudited(Auth::user(), 'unassign_ruta', $pedido, [
            'ruta_id' => $asignacion->ruta_id,
        ]));

        \DB::table('pedido_ruta')->where('id', $id)->delete();

        return response()->json(null, 204);
    }

    /**
     * @OA\Get(
     *     path="/api/rutas/optimizar",
     *     summary="Sugerir ruta óptima",
     *     tags={"Rutas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="origen_coordenadas",
     *         in="query",
     *         required=true,
     *         @OA\Schema(type="string", example="{\"lat\": -16.5, \"lng\": -68.15}")
     *     ),
     *     @OA\Parameter(
     *         name="destino_coordenadas",
     *         in="query",
     *         required=true,
     *         @OA\Schema(type="string", example="{\"lat\": -16.6, \"lng\": -68.2}")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ruta optimizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="distancia_km", type="number"),
     *             @OA\Property(property="duracion_min", type="integer"),
     *             @OA\Property(property="coordenadas", type="string")
     *         )
     *     )
     * )
     */
    public function optimizar(Request $request)
    {
        $request->validate([
            'origen_coordenadas' => 'required|json',
            'destino_coordenadas' => 'required|json',
        ]);

        $origenCoords = json_decode($request->origen_coordenadas, true);
        $destinoCoords = json_decode($request->destino_coordenadas, true);

        if (!isset($origenCoords['lat'], $origenCoords['lng'], $destinoCoords['lat'], $destinoCoords['lng'])) {
            return response()->json(['message' => 'Coordenadas inválidas'], 422);
        }

        $routeData = $this->routeService->calculateRoute($origenCoords, $destinoCoords);

        return response()->json($routeData);
    }
}