<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Conductores</title>
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
        <h1>Reporte de Conductores</h1>
        <p>Generado el {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <div class="stats">
        <h2>Estadísticas Generales</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Total de Conductores</div>
                <div class="stat-value">{{ $estadisticas['total_conductores'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total de Pedidos</div>
                <div class="stat-value">{{ $estadisticas['total_pedidos'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total de Vehículos</div>
                <div class="stat-value">{{ $estadisticas['total_vehiculos'] }}</div>
            </div>
        </div>
    </div>

    <div class="stats">
        <h2>Conductores por Estado de Verificación</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Pendientes</div>
                <div class="stat-value">{{ $estadisticas['por_estado_verificacion']['pendiente'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Verificados</div>
                <div class="stat-value">{{ $estadisticas['por_estado_verificacion']['verificado'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Rechazados</div>
                <div class="stat-value">{{ $estadisticas['por_estado_verificacion']['rechazado'] }}</div>
            </div>
        </div>
    </div>

    <h2>Lista de Conductores</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Licencia</th>
                <th>Estado</th>
                <th>Total Pedidos</th>
                <th>Total Vehículos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($conductores as $conductor)
            <tr>
                <td>{{ $conductor->id }}</td>
                <td>{{ $conductor->user->name }}</td>
                <td>{{ $conductor->user->email }}</td>
                <td>{{ $conductor->licencia }}</td>
                <td>{{ ucfirst($conductor->estado_verificacion) }}</td>
                <td>{{ $conductor->pedidos->count() }}</td>
                <td>{{ $conductor->vehiculos->count() }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>