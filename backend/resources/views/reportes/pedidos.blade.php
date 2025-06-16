<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Pedidos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            padding: 0;
        }
        .header p {
            color: #7f8c8d;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f6fa;
        }
        .stats {
            margin-bottom: 20px;
        }
        .stats h2 {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .stat-item {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 11px;
        }
        .stat-value {
            color: #2c3e50;
            font-size: 14px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Pedidos</h1>
        <p>Generado el {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <div class="stats">
        <h2>Estadísticas Generales</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Total de Pedidos</div>
                <div class="stat-value">{{ $estadisticas['total_pedidos'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Valor Total Asegurado</div>
                <div class="stat-value">${{ number_format($estadisticas['total_valor'], 2) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Peso Total</div>
                <div class="stat-value">{{ number_format($estadisticas['total_peso'], 2) }} kg</div>
            </div>
        </div>
    </div>

    <div class="stats">
        <h2>Pedidos por Estado</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Pendientes</div>
                <div class="stat-value">{{ $estadisticas['por_estado']['pendiente'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">En Progreso</div>
                <div class="stat-value">{{ $estadisticas['por_estado']['en_progreso'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Completados</div>
                <div class="stat-value">{{ $estadisticas['por_estado']['completado'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Cancelados</div>
                <div class="stat-value">{{ $estadisticas['por_estado']['cancelado'] }}</div>
            </div>
        </div>
    </div>

    <h2>Lista de Pedidos</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Conductor</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Valor Asegurado</th>
                <th>Peso</th>
                <th>Fecha Entrega</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pedidos as $pedido)
            <tr>
                <td>{{ $pedido->id }}</td>
                <td>{{ $pedido->cliente->name ?? 'N/A' }}</td>
                <td>{{ $pedido->conductor->user->name ?? 'N/A' }}</td>
                <td>{{ $pedido->direccion_origen }}</td>
                <td>{{ $pedido->direccion_destino }}</td>
                <td>{{ ucfirst($pedido->estado) }}</td>
                <td>${{ number_format($pedido->valor_asegurado, 2) }}</td>
                <td>{{ number_format($pedido->peso, 2) }} kg</td>
                <td>{{ $pedido->fecha_entrega ? $pedido->fecha_entrega->format('d/m/Y H:i') : 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>