<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Auditoría",
 *     description="Operaciones para gestionar registros de auditoría (solo administradores)"
 * )
 */
class AuditController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/audits",
     *     summary="Listar registros de auditoría",
     *     tags={"Auditoría"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="action",
     *         in="query",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="model_type",
     *         in="query",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="user_id",
     *         in="query",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de registros de auditoría",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="user_id", type="integer"),
     *                 @OA\Property(property="action", type="string"),
     *                 @OA\Property(property="model_type", type="string"),
     *                 @OA\Property(property="model_id", type="integer"),
     *                 @OA\Property(property="changes", type="object"),
     *                 @OA\Property(property="created_at", type="string")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Audit::with('user');

        if ($request->action) {
            $query->where('action', $request->action);
        }
        if ($request->model_type) {
            $query->where('model_type', $request->model_type);
        }
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $audits = $query->orderBy('created_at', 'desc')->get();
        return response()->json($audits);
    }

    /**
     * @OA\Get(
     *     path="/api/audits/model/{model}",
     *     summary="Listar registros de auditoría por modelo",
     *     tags={"Auditoría"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="model",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de registros de auditoría filtrados por modelo"
     *     )
     * )
     */
    public function getByModel($model)
    {
        $audits = Audit::with('user')
            ->where('model_type', $model)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($audits);
    }

    /**
     * @OA\Get(
     *     path="/api/audits/user/{userId}",
     *     summary="Listar registros de auditoría por usuario",
     *     tags={"Auditoría"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de registros de auditoría filtrados por usuario"
     *     )
     * )
     */
    public function getByUser($userId)
    {
        $audits = Audit::with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($audits);
    }

    /**
     * @OA\Get(
     *     path="/api/audits/action/{action}",
     *     summary="Listar registros de auditoría por acción",
     *     tags={"Auditoría"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="action",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de registros de auditoría filtrados por acción"
     *     )
     * )
     */
    public function getByAction($action)
    {
        $audits = Audit::with('user')
            ->where('action', $action)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($audits);
    }
}