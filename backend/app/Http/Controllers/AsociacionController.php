<?php

namespace App\Http\Controllers;

use App\Models\Asociacion;
use App\Models\Conductor;
use App\Models\AsociacionConductor;
use Illuminate\Http\Request;
use App\Traits\AdminAuthorization;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Asociaciones",
 *     description="Operaciones para gestionar asociaciones y sus conductores (solo administradores)"
 * )
 */
class AsociacionController extends Controller
{
    use AdminAuthorization;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/asociaciones",
     *     summary="Listar todas las asociaciones",
     *     tags={"Asociaciones"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de asociaciones",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="nombre", type="string"),
     *                 @OA\Property(property="descripcion", type="string", nullable=true)
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $asociaciones = Asociacion::with('conductores.user')->get();
        return response()->json($asociaciones);
    }

    /**
     * @OA\Post(
     *     path="/api/asociaciones",
     *     summary="Crear una nueva asociación",
     *     tags={"Asociaciones"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Asociación Norte"),
     *             @OA\Property(property="descripcion", type="string", example="Asociación de transporte del norte", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Asociación creada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="descripcion", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function store(Request $request)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $request->validate([
            'nombre' => 'required|string|max:255|unique:asociaciones,nombre',
            'descripcion' => 'nullable|string',
            'direccion' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        $asociacion = Asociacion::create($request->all());
        $this->auditAction('create', $asociacion);

        return response()->json($asociacion, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/asociaciones/{id}",
     *     summary="Actualizar una asociación",
     *     tags={"Asociaciones"},
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
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Asociación Norte"),
     *             @OA\Property(property="descripcion", type="string", example="Asociación actualizada", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Asociación actualizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="descripcion", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Asociación no encontrada"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $asociacion = Asociacion::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:asociaciones,nombre,' . $id,
            'descripcion' => 'nullable|string',
            'direccion' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        $oldData = $asociacion->toArray();
        $asociacion->update($request->all());

        $changes = array_diff_assoc($asociacion->toArray(), $oldData);
        $this->auditAction('update', $asociacion, $changes);

        return response()->json($asociacion);
    }

    /**
     * @OA\Delete(
     *     path="/api/asociaciones/{id}",
     *     summary="Eliminar una asociación",
     *     tags={"Asociaciones"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Asociación eliminada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Asociación no encontrada"
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $asociacion = Asociacion::findOrFail($id);
        $this->auditAction('delete', $asociacion);
        $asociacion->delete();

        return response()->json(null, 204);
    }

    /**
     * @OA\Post(
     *     path="/api/asociacion-conductores",
     *     summary="Asignar conductor a una asociación",
     *     tags={"Asociaciones"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"conductor_id","asociacion_id"},
     *             @OA\Property(property="conductor_id", type="integer", example=1),
     *             @OA\Property(property="asociacion_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Conductor asignado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="conductor_id", type="integer"),
     *             @OA\Property(property="asociacion_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function asignarConductor(Request $request)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        try {
        $request->validate([
            'conductor_id' => 'required|exists:conductores,id',
            'asociacion_id' => 'required|exists:asociaciones,id',
        ]);

        $exists = AsociacionConductor::where('conductor_id', $request->conductor_id)
            ->where('asociacion_id', $request->asociacion_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Conductor ya asignado a esta asociación'], 422);
        }

            $asignacion = AsociacionConductor::create([
                'conductor_id' => $request->conductor_id,
                'asociacion_id' => $request->asociacion_id
            ]);

        return response()->json($asignacion, 201);
        } catch (\Exception $e) {
            Log::error('Error al asignar conductor: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Error al asignar conductor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/asociacion-conductores/{id}",
     *     summary="Desasignar conductor de una asociación",
     *     tags={"Asociaciones"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Conductor desasignado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Asignación no encontrada"
     *     )
     * )
     */
    public function desasignarConductor($id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $asignacion = AsociacionConductor::findOrFail($id);
        $this->auditAction('unassign_driver', $asignacion->asociacion, ['conductor_id' => $asignacion->conductor_id]);
        $asignacion->delete();

        return response()->json(null, 204);
    }
}