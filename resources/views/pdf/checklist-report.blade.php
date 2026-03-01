<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Chequeo de ingreso – Orden #{{ $workOrder->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; padding: 20px; position: relative; }
        .watermark { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; opacity: 0.06; }
        .watermark img { max-width: 70%; max-height: 70%; }
        .content { position: relative; z-index: 1; }
        .header-logo { margin-bottom: 12px; }
        .header-logo img { height: 52px; display: block; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        .estado-ok { color: #16a34a; }
        .estado-no { color: #dc2626; }
        .footer { margin-top: 24px; font-size: 11px; color: #666; }
    </style>
</head>
<body>
    @if($logoDataUri ?? null)
    <div class="watermark"><img src="{{ $logoDataUri }}" alt="" /></div>
    @endif
    <div class="content">
    @if($logoDataUri ?? null)
    <div class="header-logo"><img src="{{ $logoDataUri }}" alt="RA Automotriz" /></div>
    @endif
    <h1>RA Automotriz S.A.C. – Lista de chequeo</h1>
    <div class="meta">
        Orden #{{ $workOrder->id }} · {{ $workOrder->entry_date->format('d/m/Y') }} {{ \Carbon\Carbon::parse($workOrder->entry_time)->format('H:i') }}<br>
        Cliente: {{ $clientName }} · Vehículo: {{ $vehicleLabel }}
    </div>
    <p>Se realizó el chequeo de ingreso de su vehículo. Detalle:</p>
    <table>
        <thead>
            <tr>
                <th>Ítem</th>
                <th>Estado</th>
                <th>Observación</th>
            </tr>
        </thead>
        <tbody>
            @foreach($checklistRows as $row)
            <tr>
                <td>{{ $row['name'] }}</td>
                <td class="{{ $row['checked'] ? 'estado-ok' : 'estado-no' }}">{{ $row['checked'] ? 'Bueno' : 'Malo' }}</td>
                <td>{{ $row['note'] ?: '—' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="footer">
        @if($isUpdate ?? false)
            Última actualización de la lista de chequeo: {{ $generatedAt->format('d/m/Y H:i') }}.
        @else
            Chequeo de ingreso generado el {{ $generatedAt->format('d/m/Y H:i') }}.
        @endif
        Gracias por confiar en RA Automotriz.
    </div>
    </div>
</body>
</html>
