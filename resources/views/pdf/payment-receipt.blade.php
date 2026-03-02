<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $title }} – Ref. {{ $payment->reference }}</title>
    <style>
        /* ── Reset & Base ── */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            background: #fff;
            padding: 28px 32px;
            position: relative;
        }

        /* ── Watermark ── */
        .watermark {
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            pointer-events: none; z-index: 0; opacity: 0.04;
        }
        .watermark img { max-width: 65%; max-height: 65%; }
        .content { position: relative; z-index: 1; }

        /* ── Header ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .header-left .company-name {
            font-size: 17px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 0.5px;
        }
        .header-left .company-sub {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }
        .header-right { text-align: right; }
        .header-right .doc-title {
            font-size: 15px;
            font-weight: bold;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header-right .doc-ref {
            font-size: 12px;
            color: #dc2626;
            font-weight: bold;
            margin-top: 3px;
        }
        .header-right .doc-date {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }

        /* ── Status badge ── */
        .badge-row { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .badge-paid   { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
        .badge-partial { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
        .badge-advance { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }

        /* ── Two-column info ── */
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        .info-col {
            display: table-cell;
            width: 50%;
            padding: 12px 14px;
            vertical-align: top;
        }
        .info-col:first-child { border-right: 1px solid #e5e7eb; }
        .info-col-title {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 7px;
        }
        .info-row { margin-bottom: 3px; }
        .info-label { color: #6b7280; font-size: 10px; }
        .info-value { font-size: 11px; font-weight: bold; color: #111; }

        /* ── Payment highlight box ── */
        .payment-box {
            background: #fafafa;
            border: 2px solid #dc2626;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 16px;
        }
        .payment-box-title {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .payment-box .prow {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 11px;
        }
        .payment-box .prow-total {
            display: flex;
            justify-content: space-between;
            border-top: 2px solid #dc2626;
            padding-top: 8px;
            margin-top: 6px;
            font-size: 15px;
            font-weight: bold;
            color: #dc2626;
        }

        /* ── Services table ── */
        .section-title {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            margin-bottom: 6px;
            margin-top: 16px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        thead tr { background: #dc2626; }
        thead th {
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 7px 8px;
            text-align: left;
        }
        thead th.right { text-align: right; }
        tbody tr { border-bottom: 1px solid #f1f5f9; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody td {
            padding: 6px 8px;
            font-size: 10px;
            vertical-align: top;
        }
        tbody td.right { text-align: right; font-family: DejaVu Sans Mono, monospace; }
        .type-badge {
            display: inline-block;
            font-size: 8px;
            padding: 1px 5px;
            border-radius: 3px;
            text-transform: uppercase;
            font-weight: bold;
        }
        .type-service { background: #ede9fe; color: #6d28d9; }
        .type-product { background: #d1fae5; color: #065f46; }

        /* ── Financial summary ── */
        .summary-table {
            width: 46%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        .summary-table td { padding: 4px 8px; font-size: 11px; }
        .summary-table .s-label { color: #6b7280; }
        .summary-table .s-value { text-align: right; font-family: DejaVu Sans Mono, monospace; }
        .summary-table .s-sep td { border-top: 1px dashed #d1d5db; padding-top: 5px; }
        .summary-table .s-grand td {
            border-top: 2px solid #1a1a1a;
            font-weight: bold;
            font-size: 12px;
            padding-top: 6px;
        }
        .summary-table .s-paid td { color: #16a34a; font-weight: bold; }
        .summary-table .s-pending td { color: #dc2626; font-weight: bold; }
        .summary-table .s-clear td { color: #16a34a; font-weight: bold; }

        /* ── Previous payments ── */
        .prev-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .prev-table th {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
            padding: 4px 6px;
            text-align: left;
        }
        .prev-table th.right { text-align: right; }
        .prev-table td { padding: 4px 6px; font-size: 10px; border-bottom: 1px solid #f1f5f9; }
        .prev-table td.right { text-align: right; font-family: DejaVu Sans Mono, monospace; }
        .prev-table .highlight-row td { background: #fef2f2; font-weight: bold; color: #dc2626; }

        /* ── Footer ── */
        .footer {
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .footer-left { font-size: 10px; color: #6b7280; }
        .footer-left .thank-you { font-size: 12px; font-weight: bold; color: #1a1a1a; margin-bottom: 3px; }
        .footer-right { text-align: right; font-size: 9px; color: #9ca3af; }

        /* ── Saldo pendiente / pagado ── */
        .balance-bar {
            border-radius: 4px;
            padding: 10px 14px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .balance-bar.clear { background: #dcfce7; border: 1px solid #86efac; }
        .balance-bar.pending { background: #fef2f2; border: 1px solid #fca5a5; }
        .balance-bar .bal-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .balance-bar.clear .bal-label { color: #16a34a; }
        .balance-bar.pending .bal-label { color: #dc2626; }
        .balance-bar .bal-amount { font-size: 14px; font-weight: bold; }
        .balance-bar.clear .bal-amount { color: #16a34a; }
        .balance-bar.pending .bal-amount { color: #dc2626; }
    </style>
</head>
<body>
    @if($logoDataUri ?? null)
    <div class="watermark"><img src="{{ $logoDataUri }}" alt="" /></div>
    @endif

    <div class="content">

        {{-- ── HEADER ── --}}
        <div class="header">
            <div class="header-left">
                @if($logoDataUri ?? null)
                    <img src="{{ $logoDataUri }}" alt="{{ $empresa }}" style="height:42px; display:block; margin-bottom:6px;">
                @endif
                <div class="company-name">{{ $empresa }}</div>
                <div class="company-sub">Taller de Servicio Automotriz</div>
            </div>
            <div class="header-right">
                <div class="doc-title">{{ $title }}</div>
                <div class="doc-ref">{{ $payment->reference }}</div>
                <div class="doc-date">
                    {{ $paidAt->format('d/m/Y') }} · {{ $paidAt->format('H:i') }} hrs
                </div>
            </div>
        </div>

        {{-- ── BADGE DE ESTADO ── --}}
        <div class="badge-row">
            @if($saldoPendiente <= 0)
                <span class="badge badge-paid">✓ Orden pagada en su totalidad</span>
            @elseif($payment->type === 'advance')
                <span class="badge badge-advance">Adelanto registrado</span>
            @else
                <span class="badge badge-partial">Abono parcial · Saldo pendiente: S/ {{ number_format($saldoPendiente, 2) }}</span>
            @endif
        </div>

        {{-- ── INFO CLIENTE / VEHÍCULO ── --}}
        <div class="info-grid">
            <div class="info-col">
                <div class="info-col-title">Cliente</div>
                <div class="info-row">
                    <div class="info-value">{{ $clientLabel }}</div>
                </div>
                @if($client->document_number)
                <div class="info-row">
                    <span class="info-label">{{ strtoupper($client->document_type ?? 'Doc') }}:</span>
                    <span class="info-value">{{ $client->document_number }}</span>
                </div>
                @endif
                @if($client->phone)
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">{{ $client->phone }}</span>
                </div>
                @endif
            </div>
            <div class="info-col">
                <div class="info-col-title">Vehículo · Orden #{{ $workOrder->id }}</div>
                <div class="info-row">
                    <div class="info-value">{{ $vehicleLabel }}</div>
                </div>
                @if($workOrder->vehicle)
                <div class="info-row">
                    <span class="info-label">Placa:</span>
                    <span class="info-value">{{ $workOrder->vehicle->plate }}</span>
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">Ingreso:</span>
                    <span class="info-value">
                        {{ $workOrder->entry_date->format('d/m/Y') }}
                        @if($workOrder->entry_mileage)
                            · {{ number_format($workOrder->entry_mileage, 0, '', ',') }} km
                        @endif
                    </span>
                </div>
            </div>
        </div>

        {{-- ── PAGO ACTUAL ── --}}
        <div class="payment-box">
            <div class="payment-box-title">Detalle del pago</div>
            <div class="prow">
                <span style="color:#6b7280;">Método de pago</span>
                <span style="font-weight:bold;">{{ $methodLabel }}</span>
            </div>
            <div class="prow">
                <span style="color:#6b7280;">Tipo</span>
                <span>{{ $typeLabel }}</span>
            </div>
            @if($payment->notes)
            <div class="prow">
                <span style="color:#6b7280;">Notas</span>
                <span style="max-width:65%; text-align:right;">{{ $payment->notes }}</span>
            </div>
            @endif
            <div class="prow">
                <span style="color:#6b7280;">Subtotal (sin IGV)</span>
                <span>S/ {{ number_format($baseImponible, 2) }}</span>
            </div>
            <div class="prow">
                <span style="color:#6b7280;">IGV ({{ $igvPct }}%)</span>
                <span>S/ {{ number_format($igvAmount, 2) }}</span>
            </div>
            <div class="prow-total">
                <span>MONTO PAGADO</span>
                <span>S/ {{ number_format($payment->amount, 2) }}</span>
            </div>
        </div>

        {{-- ── HISTORIAL DE PAGOS ── --}}
        @if(count($allPayments) > 1)
        <div class="section-title">Historial de pagos de la orden</div>
        <table class="prev-table">
            <thead>
                <tr>
                    <th>Referencia</th>
                    <th>Tipo</th>
                    <th>Método</th>
                    <th>Fecha</th>
                    <th class="right">Monto</th>
                </tr>
            </thead>
            <tbody>
                @foreach($allPayments as $p)
                <tr class="{{ $p['is_current'] ? 'highlight-row' : '' }}">
                    <td>{{ $p['reference'] }}{{ $p['is_current'] ? ' ←' : '' }}</td>
                    <td>{{ $p['type_label'] }}</td>
                    <td>{{ $p['method_label'] }}</td>
                    <td>{{ $p['paid_at'] }}</td>
                    <td class="right">S/ {{ $p['amount'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        {{-- ── SERVICIOS DE LA ORDEN ── --}}
        @if(count($services) > 0)
        <div class="section-title">Servicios y productos de la orden</div>
        <table>
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th class="right">Cant.</th>
                    <th class="right">P. Unit.</th>
                    <th class="right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($services as $s)
                <tr>
                    <td>{{ $s['description'] }}</td>
                    <td>
                        <span class="type-badge {{ $s['type'] === 'service' ? 'type-service' : 'type-product' }}">
                            {{ $s['type'] === 'service' ? 'Serv.' : 'Prod.' }}
                        </span>
                    </td>
                    <td class="right">{{ $s['quantity'] }}</td>
                    <td class="right">S/ {{ $s['unit_price'] }}</td>
                    <td class="right">S/ {{ $s['subtotal'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        {{-- ── RESUMEN FINANCIERO ── --}}
        <table class="summary-table">
            <tr class="s-sep">
                <td class="s-label">Subtotal (sin IGV)</td>
                <td class="s-value">S/ {{ number_format($orderBaseImponible, 2) }}</td>
            </tr>
            <tr>
                <td class="s-label">IGV ({{ $igvPct }}%)</td>
                <td class="s-value">S/ {{ number_format($orderIgvAmount, 2) }}</td>
            </tr>
            <tr class="s-grand">
                <td class="s-label">Total de la orden</td>
                <td class="s-value">S/ {{ number_format($orderTotal, 2) }}</td>
            </tr>
            <tr class="s-sep">
                <td class="s-label">Total pagado</td>
                <td class="s-value">S/ {{ number_format($totalPaid, 2) }}</td>
            </tr>
            @if($saldoPendiente > 0)
            <tr class="s-pending">
                <td class="s-label">Saldo pendiente</td>
                <td class="s-value">S/ {{ number_format($saldoPendiente, 2) }}</td>
            </tr>
            @endif
        </table>

        {{-- ── BARRA SALDO ── --}}
        @if($saldoPendiente <= 0)
        <div class="balance-bar clear">
            <span class="bal-label">✓ Orden pagada en su totalidad</span>
            <span class="bal-amount">S/ 0.00</span>
        </div>
        @else
        <div class="balance-bar pending">
            <span class="bal-label">Saldo pendiente</span>
            <span class="bal-amount">S/ {{ number_format($saldoPendiente, 2) }}</span>
        </div>
        @endif

        {{-- ── FOOTER ── --}}
        <div class="footer">
            <div class="footer-left">
                <div class="thank-you">¡Gracias por confiar en {{ $empresa }}!</div>
                <div>Este documento es un comprobante interno de referencia.</div>
                <div>Para facturación electrónica, solicítela en nuestro establecimiento.</div>
            </div>
            <div class="footer-right">
                <div>Emitido el {{ $generatedAt->format('d/m/Y') }} a las {{ $generatedAt->format('H:i') }}</div>
                <div>Ref. {{ $payment->reference }}</div>
            </div>
        </div>

    </div>
</body>
</html>
