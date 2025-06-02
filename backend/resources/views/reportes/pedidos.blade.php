<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Pedidos</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Pedidos</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Conductor</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Rutas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pedidos as $pedido)
                <tr>
                    <td>{{ $pedido->id }}</td>
                    <td>{{ $pedido->cliente->name }}</td>
                    <td>{{ $pedido->conductor ? $pedido->conductor->user->name : 'Sin asignar' }}</td>
                    <td>{{ $pedido->origen }}</td>
                    <td>{{ $pedido->destino }}</td>
                    <td>{{ $pedido->estado }}</td>
                    <td>
                        @foreach($pedido->rutas as $ruta)
                            {{ $ruta->nombre }}<br>
                        @endforeach
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>