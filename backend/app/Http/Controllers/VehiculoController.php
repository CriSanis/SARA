<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\Conductor;
use Illuminate\Http\Request;
use App\Traits\AdminAuthorization;

/**
 * @OA\Tag(
 *     name="Vehículos",
 *     description="Operaciones para gestionar vehículos (solo administradores)"
 * )
 */
class VehiculoController extends Controller
{
    use AdminAuthorization;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/vehiculos",
     *     summary="Listar todos los vehículos",
     *     tags={"Vehículos"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de vehículos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="conductor_id", type="integer"),
     *                 @OA\Property(property="marca", type="string"),
     *                 @OA\Property(property="modelo", type="string"),
     *                 @OA\Property(property="placa", type="string"),
     *                 @OA\Property(property="capacidad", type="number")
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

        $vehiculos = Vehiculo::with('conductor.user')->get();
        return response()->json($vehiculos);
    }

    /**
     * @OA\Post(
     *     path="/api/vehiculos",
     *     summary="Crear un nuevo vehículo",
     *     tags={"Vehículos"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"conductor_id","marca","modelo","placa","capacidad"},
     *             @OA\Property(property="conductor_id", type="integer", example=1),
     *             @OA\Property(property="marca", type="string", example="Toyota"),
     *             @OA\Property(property="modelo", type="string", example="Hilux"),
     *             @OA\Property(property="placa", type="string", example="ABC-123"),
     *             @OA\Property(property="capacidad", type="number", example=2.5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Vehículo creado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="conductor_id", type="integer"),
     *             @OA\Property(property="marca", type="string"),
     *             @OA\Property(property="modelo", type="string"),
     *             @OA\Property(property="placa", type="string"),
     *             @OA\Property(property="capacidad", type="number")
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
            'conductor_id' => 'required|exists:conductores,id',
            'marca' => 'required|string|max:255',
            'modelo' => 'required|string|max:255',
            'placa' => 'required|string|max:20|unique:vehiculos,placa',
            'capacidad' => 'required|numeric|min:0.1',
        ]);

        $vehiculo = Vehiculo::create($request->all());
        $this->auditAction('create', $vehiculo);

        return response()->json($vehiculo, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/vehiculos/{id}",
     *     summary="Actualizar un vehículo",
     *     tags={"Vehículos"},
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
     *             required={"conductor_id","marca","modelo","placa","capacidad"},
     *             @OA\Property(property="conductor_id", type="integer", example=1),
     *             @OA\Property(property="marca", type="string", example="Toyota"),
     *             @OA\Property(property="modelo", type="string", example="Hilux"),
     *             @OA\Property(property="placa", type="string", example="ABC-123"),
     *             @OA\Property(property="capacidad", type="number", example=2.5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vehículo actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="conductor_id", type="integer"),
     *             @OA\Property(property="marca", type="string"),
     *             @OA\Property(property="modelo", type="string"),
     *             @OA\Property(property="placa", type="string"),
     *             @OA\Property(property="capacidad", type="number")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Vehículo no encontrado"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $vehiculo = Vehiculo::findOrFail($id);

        $request->validate([
            'conductor_id' => 'required|exists:conductores,id',
            'marca' => 'required|string|max:255',
            'modelo' => 'required|string|max:255',
            'placa' => 'required|string|max:20|unique:vehiculos,placa,' . $id,
            'capacidad' => 'required|numeric|min:0.1',
        ]);

        $oldData = $vehiculo->toArray();
        $vehiculo->update($request->all());

        $changes = array_diff_assoc($vehiculo->toArray(), $oldData);
        $this->auditAction('update', $vehiculo, $changes);

        return response()->json($vehiculo->load('conductor.user'));
    }

    /**
     * @OA\Delete(
     *     path="/api/vehiculos/{id}",
     *     summary="Eliminar un vehículo",
     *     tags={"Vehículos"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Vehículo eliminado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Vehículo no encontrado"
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $vehiculo = Vehiculo::findOrFail($id);
        $this->auditAction('delete', $vehiculo);
        $vehiculo->delete();

        return response()->json(null, 204);
    }
}