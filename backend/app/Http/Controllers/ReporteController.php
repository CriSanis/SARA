<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Conductor;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Traits\AdminAuthorization;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Reportes",
 *     description="Operaciones para generar reportes (solo administradores)"
 * )
 */
class ReporteController extends Controller
{
    use AdminAuthorization;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * @OA\Get(
     *     path="/api/reportes/pedidos",
     *     summary="Reporte de pedidos",
     *     tags={"Reportes"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="estado",
     *         in="query",
     *         @OA\Schema(type="string", enum={"pendiente","en_progreso","completado"})
     *     ),
     *     @OA\Parameter(
     *         name="cliente_id",
     *         in="query",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="fecha_inicio",
     *         in="query",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="fecha_fin",
     *         in="query",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte generado",
     *         @OA\MediaType(
     *             mediaType="application/pdf"
     *         )
     *     )
     * )
     */
    public function reportePedidos(Request $request)
    {
        try {
            if ($error = $this->checkAdminRole()) {
                return $error;
            }

            $request->validate([
                'estado' => 'nullable|in:pendiente,en_progreso,completado,cancelado',
                'cliente_id' => 'nullable|exists:users,id',
                'fecha_inicio' => 'nullable|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            ]);

            $query = Pedido::with(['cliente', 'conductor.user'])
                ->orderBy('created_at', 'desc');

            if ($request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->cliente_id) {
                $query->where('cliente_id', $request->cliente_id);
            }

            if ($request->fecha_inicio) {
                $query->whereDate('created_at', '>=', $request->fecha_inicio);
            }

            if ($request->fecha_fin) {
                $query->whereDate('created_at', '<=', $request->fecha_fin);
            }

            $pedidos = $query->get();

            // Generar estadísticas
            $estadisticas = [
                'total_pedidos' => $pedidos->count(),
                'total_valor' => $pedidos->sum('valor_asegurado'),
                'total_peso' => $pedidos->sum('peso'),
                'por_estado' => [
                    'pendiente' => $pedidos->where('estado', 'pendiente')->count(),
                    'en_progreso' => $pedidos->where('estado', 'en_progreso')->count(),
                    'completado' => $pedidos->where('estado', 'completado')->count(),
                    'cancelado' => $pedidos->where('estado', 'cancelado')->count(),
                ]
            ];

            // Generar PDF
            $pdf = PDF::loadView('reportes.pedidos', [
                'pedidos' => $pedidos,
                'estadisticas' => $estadisticas,
                'filtros' => $request->all()
            ]);

            return $pdf->download('reporte_pedidos.pdf');

        } catch (\Exception $e) {
            Log::error('Error al generar reporte de pedidos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al generar el reporte'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/reportes/conductores",
     *     summary="Reporte de conductores",
     *     tags={"Reportes"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="conductor_id",
     *         in="query",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte generado",
     *         @OA\MediaType(
     *             mediaType="application/pdf"
     *         )
     *     )
     * )
     */
    public function reporteConductores(Request $request)
    {
        try {
            if ($error = $this->checkAdminRole()) {
                return $error;
            }

            $request->validate([
                'conductor_id' => 'nullable|exists:conductores,id',
                'estado_verificacion' => 'nullable|in:pendiente,verificado,rechazado',
                'fecha_inicio' => 'nullable|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            ]);

            $query = Conductor::with(['user', 'pedidos', 'vehiculos']);

            if ($request->conductor_id) {
                $query->where('id', $request->conductor_id);
            }

            if ($request->estado_verificacion) {
                $query->where('estado_verificacion', $request->estado_verificacion);
            }

            $conductores = $query->get();

            // Generar estadísticas
            $estadisticas = [
                'total_conductores' => $conductores->count(),
                'por_estado_verificacion' => [
                    'pendiente' => $conductores->where('estado_verificacion', 'pendiente')->count(),
                    'verificado' => $conductores->where('estado_verificacion', 'verificado')->count(),
                    'rechazado' => $conductores->where('estado_verificacion', 'rechazado')->count(),
                ],
                'total_pedidos' => $conductores->sum(function ($conductor) {
                    return $conductor->pedidos->count();
                }),
                'total_vehiculos' => $conductores->sum(function ($conductor) {
                    return $conductor->vehiculos->count();
                })
            ];

            // Generar PDF
            $pdf = PDF::loadView('reportes.conductores', [
                'conductores' => $conductores,
                'estadisticas' => $estadisticas,
                'filtros' => $request->all()
            ]);

            return $pdf->download('reporte_conductores.pdf');

        } catch (\Exception $e) {
            Log::error('Error al generar reporte de conductores: ' . $e->getMessage());
            return response()->json(['error' => 'Error al generar el reporte'], 500);
        }
    }
}