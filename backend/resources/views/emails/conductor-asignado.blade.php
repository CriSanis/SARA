<!DOCTYPE html>
<html>
<head>
    <title>Conductor Asignado</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
        }
        .info {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Conductor Asignado</h1>
        </div>
        <div class="content">
            <p>Hola {{ $pedido->cliente->name }},</p>
            
            <p>Te informamos que se ha asignado un conductor a tu pedido:</p>
            
            <div class="info">
                <p><strong>Conductor:</strong> {{ $conductor->user->name }}</p>
                <p><strong>Origen:</strong> {{ $pedido->origen }}</p>
                <p><strong>Destino:</strong> {{ $pedido->destino }}</p>
                <p><strong>Estado:</strong> {{ $pedido->estado }}</p>
            </div>

            <p>El conductor se pondrá en contacto contigo pronto para coordinar los detalles del envío.</p>
            
            <p>Gracias por confiar en nuestro servicio.</p>
        </div>
        <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    </div>
</body>
</html> 