<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Conductores</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Conductores</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Total Pedidos</th>
                <th>Pedidos Completados</th>
            </tr>
        </thead>
        <tbody>
            @foreach($conductores as $conductor)
                <tr>
                    <td>{{ $conductor->id }}</td>
                    <td>{{ $conductor->user->name }}</td>
                    <td>{{ $conductor->pedidos->count() }}</td>
                    <td>{{ $conductor->pedidos->where('estado', 'completado')->count() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>