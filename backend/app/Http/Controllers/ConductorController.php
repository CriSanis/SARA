<?php

namespace App\Http\Controllers;

use App\Models\Conductor;
use Illuminate\Http\Request;
use App\Traits\AdminAuthorization;

/**
 * @OA\Tag(
 *     name="Conductores",
 *     description="Operaciones para gestionar conductores (solo administradores)"
 * )
 */
class ConductorController extends Controller
{
    use AdminAuthorization;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/conductores",
     *     summary="Listar todos los conductores",
     *     tags={"Conductores"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de conductores",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="user_id", type="integer"),
     *                 @OA\Property(property="licencia", type="string"),
     *                 @OA\Property(property="estado_verificacion", type="string"),
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="email", type="string")
     *                 )
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

        $conductores = Conductor::with(['user', 'vehiculos'])->get();
        return response()->json($conductores);
    }

    /**
     * @OA\Put(
     *     path="/api/conductores/{id}/verificar",
     *     summary="Verificar un conductor",
     *     tags={"Conductores"},
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
     *             required={"estado_verificacion"},
     *             @OA\Property(property="estado_verificacion", type="string", enum={"pendiente","verificado","rechazado"}, example="verificado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Conductor verificado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="licencia", type="string"),
     *             @OA\Property(property="estado_verificacion", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conductor no encontrado"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function verificar(Request $request, $id)
    {
        if ($error = $this->checkAdminRole()) {
            return $error;
        }

        $request->validate([
            'estado_verificacion' => 'required|in:verificado,rechazado'
        ]);

        $conductor = Conductor::findOrFail($id);
        $oldData = $conductor->toArray();
        
        $conductor->update([
            'estado_verificacion' => $request->estado_verificacion
        ]);

        $changes = array_diff_assoc($conductor->toArray(), $oldData);
        $this->auditAction('verify', $conductor, $changes);

        return response()->json($conductor);
    }
}