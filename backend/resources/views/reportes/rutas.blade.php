<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Rutas</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Rutas</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Distancia (km)</th>
                <th>Total Pedidos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rutas as $ruta)
                <tr>
                    <td>{{ $ruta->id }}</td>
                    <td>{{ $ruta->nombre }}</td>
                    <td>{{ $ruta->origen }}</td>
                    <td>{{ $ruta->destino }}</td>
                    <td>{{ $ruta->distancia_km }}</td>
                    <td>{{ $ruta->pedidos->count() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>