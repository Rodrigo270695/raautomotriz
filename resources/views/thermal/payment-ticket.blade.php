<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=302">
    <title>Comprobante {{ $payment->reference }}</title>
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
        @media print {
            body { padding: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="center bold mb">{{ $title }}</div>
    <div class="center" style="font-size: 11px;">Ref. {{ $payment->reference }}</div>
    <div class="center" style="font-size: 11px;">Orden #{{ $work_order->id }} · {{ $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : '—' }}</div>
    <hr class="mt">
    <div class="row mt"><span>Vehículo:</span><span>{{ $vehicleLabel }}</span></div>
    <div class="row"><span>Cliente:</span><span>{{ $clientLabel }}</span></div>
    <div class="row mt"><span>Método:</span><span>{{ $methodLabel }}</span></div>
    <hr class="mt">
    <div class="row mt"><span>Subtotal (base)</span><span>S/ {{ number_format($baseImponible, 2) }}</span></div>
    <div class="row"><span>IGV (18%)</span><span>S/ {{ number_format($igv, 2) }}</span></div>
    <div class="row bold mt"><span>TOTAL</span><span>S/ {{ number_format($amount, 2) }}</span></div>
    <hr class="mt">
    <div class="center mt" style="font-size: 10px;">Referencia para facturación</div>
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
