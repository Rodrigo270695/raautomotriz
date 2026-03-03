<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Resumen de orden #{{ $work_order->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 9px;
            color: #1a1a1a;
            background: #fff;
            padding: 20px 26px 16px;
        }

        /* ── Marca de agua diagonal ─────────────────────────────── */
        .watermark {
            position: fixed;
            top: 50%; left: 50%;
            width: 380px;
            margin-left: -190px;
            margin-top: -90px;
            opacity: 0.042;
            transform: rotate(-35deg);
            z-index: 0;
        }
        .content { position: relative; z-index: 1; }

        /* ── Header ─────────────────────────────────────────────── */
        .header-tbl { width: 100%; border-collapse: collapse; border-bottom: 3px solid #cc1f1f; padding-bottom: 10px; margin-bottom: 10px; }
        .header-tbl td { vertical-align: top; padding-bottom: 8px; }
        .logo-img { height: 40px; }
        .company-sub { font-size: 7.5px; color: #999; margin-top: 2px; letter-spacing: 0.2px; }
        .doc-title { font-size: 13px; font-weight: bold; color: #1c2d4f; text-transform: uppercase; letter-spacing: 0.8px; text-align: right; }
        .doc-sub   { font-size: 8px; color: #999; text-align: right; margin-top: 1px; }
        .doc-ref   { display: inline-block; margin-top: 5px; font-size: 10px; font-weight: bold;
                     color: #fff; background: #cc1f1f; padding: 2px 10px; border-radius: 3px; }

        /* ── Status strip ────────────────────────────────────────── */
        .strip-tbl { width: 100%; border-collapse: collapse; background: #1c2d4f;
                     border-radius: 4px; margin-bottom: 10px; }
        .strip-tbl td { padding: 6px 10px; vertical-align: middle; color: #fff; }
        .strip-label { font-size: 7.5px; opacity: .7; display: block; }
        .strip-val   { font-size: 9px; font-weight: bold; display: block; margin-top: 1px; }
        .badge-del   { display: inline-block; background: #16a34a; color: #fff;
                       font-size: 7.5px; font-weight: bold; padding: 2px 9px;
                       border-radius: 20px; letter-spacing: 0.3px; text-transform: uppercase; }

        /* ── Section title ───────────────────────────────────────── */
        .stitle { font-size: 7.5px; font-weight: bold; color: #1c2d4f; text-transform: uppercase;
                  letter-spacing: 0.5px; border-left: 3px solid #cc1f1f;
                  padding-left: 5px; margin-bottom: 5px; margin-top: 9px; }

        /* ── Info table (key/value) ──────────────────────────────── */
        .info-tbl { width: 100%; border-collapse: collapse; }
        .info-tbl td { font-size: 8.5px; padding: 1.8px 0; vertical-align: top; }
        .info-key { color: #777; width: 32%; padding-right: 4px; }
        .info-val { font-weight: bold; color: #1a1a1a; }

        /* ── Two-column wrapper ─────────────────────────────────── */
        .two-col { width: 100%; border-collapse: collapse; }
        .two-col > tbody > tr > td { vertical-align: top; padding: 0; }
        .col-l { width: 48%; padding-right: 8px; }
        .col-r { width: 48%; padding-left: 8px; }

        /* ── Generic table ───────────────────────────────────────── */
        .gtbl { width: 100%; border-collapse: collapse; }
        .gtbl thead th {
            background: #1c2d4f; color: #fff; font-size: 7.5px;
            padding: 3.5px 5px; text-align: left; font-weight: bold;
        }
        .gtbl thead th.r { text-align: right; }
        .gtbl tbody td { font-size: 8px; padding: 2.5px 5px; border-bottom: 1px solid #ececec; vertical-align: top; }
        .gtbl tbody tr:nth-child(even) td { background: #f8fafc; }
        .tr  { text-align: right; }
        .tc  { text-align: center; }
        .muted { color: #aaa; font-style: italic; }

        /* ── Checklist ───────────────────────────────────────────── */
        .cl-ok   { color: #16a34a; font-weight: bold; }
        .cl-fail { color: #cc1f1f; font-weight: bold; }

        /* ── Totals ──────────────────────────────────────────────── */
        .totals-tbl { width: 100%; border-collapse: collapse; margin-top: 3px; border-top: 2px solid #1c2d4f; }
        .totals-tbl td { font-size: 8px; padding: 1.8px 5px; }
        .totals-grand td { font-size: 9.5px; font-weight: bold; color: #1c2d4f; border-top: 1px solid #ddd; padding-top: 3px; }

        /* ── Payment summary pills ───────────────────────────────── */
        .pay-pills { width: 100%; border-collapse: collapse; background: #f0f4f8;
                     border: 1px solid #dde3ea; border-radius: 3px; margin-top: 4px; }
        .pay-pills td { padding: 4px 8px; text-align: center; vertical-align: middle; }
        .ppill-lbl { font-size: 7.5px; color: #666; display: block; }
        .ppill-val { font-size: 9.5px; font-weight: bold; color: #1c2d4f; display: block; margin-top: 1px; }
        .ppill-green .ppill-val { color: #16a34a; }
        .ppill-amber .ppill-val { color: #b45309; }

        /* ── Photos ──────────────────────────────────────────────── */
        .photo-row td { vertical-align: top; padding: 3px; }
        .photo-cell { text-align: center; }
        .photo-cell img { max-width: 100%; height: 78px; object-fit: cover; border-radius: 3px; border: 1px solid #dde3ea; }
        .photo-type { font-size: 7px; color: #888; margin-top: 2px; }

        /* ── Footer ──────────────────────────────────────────────── */
        .footer-tbl { width: 100%; border-collapse: collapse; border-top: 1px solid #e5e7eb; margin-top: 12px; padding-top: 6px; }
        .footer-tbl td { font-size: 7px; color: #bbb; padding-top: 5px; }
        .footer-right { text-align: right; }
        .footer-right span { color: #cc1f1f; font-weight: bold; }

        .sep { border: none; border-top: 1px solid #ececec; margin: 8px 0; }
    </style>
</head>
<body>

{{-- Marca de agua --}}
@if($logoDataUri)
<img class="watermark" src="{{ $logoDataUri }}" alt="">
@endif

<div class="content">

{{-- ── HEADER ──────────────────────────────────────────────────── --}}
<table class="header-tbl">
    <tbody><tr>
        <td>
            @if($logoDataUri)
                <img class="logo-img" src="{{ $logoDataUri }}" alt="{{ $empresa }}">
            @else
                <strong style="font-size:14px;color:#cc1f1f;">{{ $empresa }}</strong>
            @endif
            <div class="company-sub">Taller Especializado</div>
        </td>
        <td style="text-align:right;">
            <div class="doc-title">Resumen de orden</div>
            <div class="doc-sub">Documento de entrega al cliente</div>
            <div style="text-align:right;"><span class="doc-ref">Orden #{{ $work_order->id }}</span></div>
        </td>
    </tr></tbody>
</table>

{{-- ── STRIP ESTADO ────────────────────────────────────────────── --}}
<table class="strip-tbl">
    <tbody><tr>
        <td style="width:28%">
            <span class="strip-label">Vehículo</span>
            <span class="strip-val">{{ $vehicleLabel }}  |  {{ $plate }}</span>
        </td>
        <td style="width:26%">
            <span class="strip-label">Cliente</span>
            <span class="strip-val">{{ $clientLabel }}</span>
        </td>
        <td style="width:20%">
            <span class="strip-label">F. ingreso</span>
            <span class="strip-val">{{ \Carbon\Carbon::parse($work_order->entry_date)->format('d/m/Y') }}{{ $work_order->entry_time ? '  '.substr($work_order->entry_time,0,5) : '' }}</span>
        </td>
        @if($work_order->entry_mileage)
        <td style="width:16%">
            <span class="strip-label">Km. ingreso</span>
            <span class="strip-val">{{ number_format($work_order->entry_mileage,0,'.',',') }} km</span>
        </td>
        @endif
        <td style="text-align:right; padding-right:12px;">
            <span class="strip-label">Estado</span>
            <span style="display:block;margin-top:3px;"><span class="badge-del">{{ $statusLabels[$work_order->status] ?? $work_order->status }}</span></span>
        </td>
    </tr></tbody>
</table>

{{-- ── FILA 1: datos generales + checklist ────────────────────── --}}
<table class="two-col">
    <tbody><tr>
        <td class="col-l">
            <div class="stitle">Datos de la orden</div>
            <table class="info-tbl">
                <tbody>
                    @if($work_order->client_observation)
                    <tr><td class="info-key">Observación</td><td class="info-val">{{ $work_order->client_observation }}</td></tr>
                    @endif
                    @if($work_order->notes)
                    <tr><td class="info-key">Notas internas</td><td class="info-val">{{ $work_order->notes }}</td></tr>
                    @endif
                    @if($work_order->exit_mileage)
                    <tr><td class="info-key">Km. salida</td><td class="info-val">{{ number_format($work_order->exit_mileage,0,'.',',') }} km</td></tr>
                    @endif
                    @php $adv = (float)$work_order->advance_payment_amount; @endphp
                    @if($adv > 0)
                    <tr><td class="info-key">Adelanto</td><td class="info-val">S/ {{ number_format($adv,2) }}</td></tr>
                    @endif
                    <tr>
                        <td class="info-key">Generado</td>
                        <td class="info-val">{{ $generatedAt->format('d/m/Y H:i') }}</td>
                    </tr>
                </tbody>
            </table>
        </td>
        <td class="col-r">
            @if(count($checklistRows) > 0)
            <div class="stitle">Lista de chequeo</div>
            <table class="gtbl">
                <thead><tr>
                    <th>Ítem</th>
                    <th class="tc" style="width:30px">Est.</th>
                    <th style="width:38%">Nota</th>
                </tr></thead>
                <tbody>
                    @foreach($checklistRows as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="tc">
                            @if($row['checked'])<span class="cl-ok">✓</span>@else<span class="cl-fail">✗</span>@endif
                        </td>
                        <td class="{{ $row['note'] ? '' : 'muted' }}">{{ $row['note'] ?: '—' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
        </td>
    </tr></tbody>
</table>

{{-- ── DIAGNÓSTICOS ────────────────────────────────────────────── --}}
@if(count($diagnoses) > 0)
<div class="stitle">Diagnósticos ({{ count($diagnoses) }})</div>
<table class="gtbl">
    <thead><tr>
        <th style="width:42%">Diagnóstico</th>
        <th style="width:22%">Técnico</th>
        <th style="width:16%">Fecha</th>
        <th>Notas internas</th>
    </tr></thead>
    <tbody>
        @foreach($diagnoses as $d)
        <tr>
            <td>{{ $d['text'] }}</td>
            <td>{{ $d['diagnosed_by'] }}</td>
            <td>{{ $d['diagnosed_at'] }}</td>
            <td class="{{ $d['internal_notes'] ? '' : 'muted' }}">{{ $d['internal_notes'] ?: '—' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ── SERVICIOS ───────────────────────────────────────────────── --}}
@if(count($serviceLines) > 0)
<div class="stitle">Servicios y productos</div>
<table class="gtbl">
    <thead><tr>
        <th style="width:38%">Descripción</th>
        <th style="width:26%">Paquete</th>
        <th class="r" style="width:11%">Cant.</th>
        <th class="r" style="width:12%">P. Unit.</th>
        <th class="r" style="width:13%">Subtotal</th>
    </tr></thead>
    <tbody>
        @foreach($serviceLines as $s)
        <tr>
            <td>{{ $s['description'] }}</td>
            <td class="{{ $s['package'] ? '' : 'muted' }}">{{ $s['package'] ?: '—' }}</td>
            <td class="tr">{{ number_format($s['quantity'],2) }}</td>
            <td class="tr">S/ {{ number_format($s['unit_price'],2) }}</td>
            <td class="tr">S/ {{ number_format($s['subtotal'],2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<table class="totals-tbl">
    <tbody>
        <tr><td style="color:#888;">Subtotal base (sin IGV)</td><td class="tr" style="color:#888;">S/ {{ number_format($baseImponible,2) }}</td></tr>
        <tr><td style="color:#888;">IGV ({{ $igvPct }}%)</td><td class="tr" style="color:#888;">S/ {{ number_format($igvAmount,2) }}</td></tr>
    </tbody>
    <tbody class="totals-grand">
        <tr><td>Total de la orden</td><td class="tr">S/ {{ number_format($servicesTotal,2) }}</td></tr>
    </tbody>
</table>
@endif

{{-- ── PAGOS ────────────────────────────────────────────────────── --}}
@if(count($paymentLines) > 0)
<div class="stitle">Historial de pagos</div>
<table class="gtbl">
    <thead><tr>
        <th style="width:20%">Referencia</th>
        <th style="width:20%">Tipo</th>
        <th style="width:20%">Método</th>
        <th style="width:22%">Fecha</th>
        <th class="r" style="width:18%">Monto</th>
    </tr></thead>
    <tbody>
        @foreach($paymentLines as $p)
        <tr>
            <td style="font-weight:bold;color:#1c2d4f;">{{ $p['reference'] }}</td>
            <td>{{ $p['type_label'] }}</td>
            <td>{{ $p['method_label'] }}</td>
            <td>{{ $p['paid_at'] }}</td>
            <td class="tr">S/ {{ number_format($p['amount'],2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<table class="pay-pills">
    <tbody><tr>
        <td class="ppill-green">
            <span class="ppill-lbl">Total pagado</span>
            <span class="ppill-val">S/ {{ number_format($totalPaid,2) }}</span>
        </td>
        <td>
            <span class="ppill-lbl">Total orden</span>
            <span class="ppill-val">S/ {{ number_format($servicesTotal,2) }}</span>
        </td>
        <td class="{{ $saldoPendiente > 0 ? 'ppill-amber' : 'ppill-green' }}">
            <span class="ppill-lbl">Saldo pendiente</span>
            <span class="ppill-val">{{ $saldoPendiente > 0 ? 'S/ '.number_format($saldoPendiente,2) : 'Pagado ✓' }}</span>
        </td>
    </tr></tbody>
</table>
@endif

{{-- ── FOTOS ────────────────────────────────────────────────────── --}}
@php
    $photoTypes = [
        'entry'    => ['label' => 'Ingreso',     'photos' => $photosByType['entry']    ?? []],
        'delivery' => ['label' => 'Entrega',      'photos' => $photosByType['delivery'] ?? []],
        'process'  => ['label' => 'Proceso',      'photos' => $photosByType['process']  ?? []],
        'diagnosis'=> ['label' => 'Diagnóstico',  'photos' => $photosByType['diagnosis']?? []],
    ];
    $hasPhotos = collect($photoTypes)->some(fn($g) => count($g['photos']) > 0);
@endphp
@if($hasPhotos)
<div class="stitle">Fotos registradas</div>
@foreach($photoTypes as $typeKey => $group)
    @if(count($group['photos']) > 0)
    <div style="font-size:8px;color:#555;font-weight:bold;margin:4px 0 3px;text-transform:uppercase;letter-spacing:0.3px;">
        {{ $group['label'] }} ({{ count($group['photos']) }})
    </div>
    @php $chunks = array_chunk($group['photos'], 4); @endphp
    @foreach($chunks as $row)
    <table style="width:100%;border-collapse:collapse;margin-bottom:2px;">
        <tbody><tr class="photo-row">
            @foreach($row as $photo)
            <td class="photo-cell" style="width:24%;">
                @if($photo['dataUri'])
                <img src="{{ $photo['dataUri'] }}" alt="Foto {{ $group['label'] }}" style="max-width:100%;height:74px;object-fit:cover;border-radius:3px;border:1px solid #dde3ea;">
                @else
                <div style="height:74px;background:#f1f5f9;border:1px solid #dde3ea;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#aaa;">Sin imagen</div>
                @endif
                @if($photo['caption'])
                <div style="font-size:7px;color:#777;margin-top:2px;text-align:center;">{{ Str::limit($photo['caption'],30) }}</div>
                @endif
            </td>
            @endforeach
            {{-- Celdas vacías para completar la fila de 4 --}}
            @for($i = count($row); $i < 4; $i++)
            <td style="width:24%;"></td>
            @endfor
        </tr></tbody>
    </table>
    @endforeach
    @endif
@endforeach
@endif

{{-- ── FOOTER ───────────────────────────────────────────────────── --}}
<table class="footer-tbl">
    <tbody><tr>
        <td>Generado el {{ $generatedAt->format('d/m/Y H:i') }} (hora Lima) &nbsp;·&nbsp; {{ $empresa }}</td>
        <td class="footer-right">Documento confidencial &nbsp;·&nbsp; <span>{{ $empresa }}</span></td>
    </tr></tbody>
</table>

</div>
</body>
</html>
