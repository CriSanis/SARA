<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Conductor;
use App\Models\Ruta;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * @OA\Tag(
 *     name="Reportes",
 *     description="Operaciones para generar reportes (solo administradores)"
 * )
 */
class ReporteController extends Controller
{
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
        $request->validate([
            'estado' => 'nullable|in:pendiente,en_progreso,completado',
            'cliente_id' => 'nullable|exists:users,id',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $query = Pedido::with(['cliente', 'conductor.user', 'rutas']);

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

        $pdf = Pdf::loadView('reportes.pedidos', compact('pedidos'));
        return $pdf->download('reporte_pedidos.pdf');
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
        $request->validate([
            'conductor_id' => 'nullable|exists:conductores,id',
        ]);

        $query = Conductor::with(['user', 'pedidos']);

        if ($request->conductor_id) {
            $query->where('id', $request->conductor_id);
        }

        $conductores = $query->get();

        $pdf = Pdf::loadView('reportes.conductores', compact('conductores'));
        return $pdf->download('reporte_conductores.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reportes/rutas",
     *     summary="Reporte de rutas",
     *     tags={"Reportes"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="ruta_id",
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
    public function reporteRutas(Request $request)
    {
        $request->validate([
            'ruta_id' => 'nullable|exists:rutas,id',
        ]);

        $query = Ruta::with('pedidos');

        if ($request->ruta_id) {
            $query->where('id', $request->ruta_id);
        }

        $rutas = $query->get();

        $pdf = Pdf::loadView('reportes.rutas', compact('rutas'));
        return $pdf->download('reporte_rutas.pdf');
    }
}