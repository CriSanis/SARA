<?php

namespace App\Http\Controllers;

use App\Models\Conductor;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Conductores",
 *     description="Operaciones para gestionar conductores (solo administradores)"
 * )
 */
class ConductorController extends Controller
{
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
        $request->validate([
            'estado_verificacion' => 'required|in:pendiente,verificado,rechazado',
        ]);

        $conductor = Conductor::findOrFail($id);
        $conductor->update([
            'estado_verificacion' => $request->estado_verificacion,
        ]);

        return response()->json($conductor);
    }
}