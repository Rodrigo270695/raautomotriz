<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=302">
    <title>Ticket Orden #{{ $work_order->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.3;
            width: 302px;
            max-width: 302px;
            padding: 8px;
            color: #000;
            background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .mt { margin-top: 6px; }
        .mb { margin-bottom: 4px; }
        hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; gap: 8px; }
        .row span:last-child { text-align: right; white-space: nowrap; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        table td { padding: 2px 0; }
        table td:last-child { text-align: right; }
        @media print {
            body { padding: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="center bold mb">ORDEN DE TRABAJO</div>
    <div class="center" style="font-size: 11px;">#{{ $work_order->id }} · {{ $work_order->entry_date->format('d/m/Y') }} {{ \Carbon\Carbon::parse($work_order->entry_time)->format('H:i') }}</div>
    <hr class="mt">
    <div class="row mt"><span>Vehículo:</span><span>{{ $vehicleLabel }}</span></div>
    <div class="row"><span>Cliente:</span><span>{{ $clientLabel }}</span></div>
    <hr class="mt">
    <div class="bold mt mb">Servicios / Productos</div>
    <table>
        @foreach($services as $s)
        <tr>
            <td style="width: 55%; max-width: 165px; overflow: hidden; text-overflow: ellipsis; vertical-align: top;">{{ Str::limit($s['description'] ?? '—', 32) }}</td>
            <td style="white-space: nowrap; vertical-align: top;">{{ number_format($s['quantity'], 2) }} x S/ {{ number_format($s['unit_price'], 2) }}</td>
        </tr>
        <tr>
            <td></td>
            <td>S/ {{ number_format($s['subtotal'], 2) }}</td>
        </tr>
        @endforeach
    </table>
    <hr class="mt">
    <div class="row mt"><span>Subtotal (base)</span><span>S/ {{ number_format($baseImponible, 2) }}</span></div>
    <div class="row"><span>IGV (18%)</span><span>S/ {{ number_format($igv, 2) }}</span></div>
    <div class="row bold mt"><span>TOTAL</span><span>S/ {{ number_format($servicesTotal, 2) }}</span></div>
    <hr class="mt">
    <div class="center mt" style="font-size: 14px; letter-spacing: 2px;">{{ $ticket->token }}</div>
    <div class="center mt" style="font-size: 10px;">Código del ticket</div>
    <div class="center mt" style="font-size: 10px;">Estado: En reparación</div>
    <div class="center mt no-print" style="font-size: 10px;">
        <button type="button" onclick="window.print();">Imprimir</button>
    </div>
    <script>
        window.onload = function() {
            if (!window.frameElement) window.print();
        };
    </script>
</body>
</html>
