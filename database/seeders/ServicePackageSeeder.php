<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ServicePackage;
use App\Models\ServicePackageItem;
use App\Models\ServiceType;
use Illuminate\Database\Seeder;

class ServicePackageSeeder extends Seeder
{
    // ─────────────────────────────────────────────────────────────
    // Tipos de servicio
    // ─────────────────────────────────────────────────────────────

    private const SERVICE_TYPES = [
        ['Preventivo',         'Servicios de mantenimiento programado para prevenir fallas.'],
        ['Correctivo',         'Reparaciones para solucionar fallas o desgaste detectado.'],
        ['Diagnóstico',        'Evaluación y diagnóstico del estado general del vehículo.'],
        ['Eléctrico',          'Servicio especializado en el sistema eléctrico y electrónico.'],
        ['Latonería y Pintura','Corrección de daños en carrocería, abolladuras y pintura.'],
    ];

    // ─────────────────────────────────────────────────────────────
    // Catálogo de paquetes
    // ─────────────────────────────────────────────────────────────
    // Estructura por paquete:
    //   'nombre' => [
    //       'service_type' => 'Tipo',
    //       'description'  => '...',
    //       'sort_order'   => N,
    //       'items' => [
    //           // línea de MANO DE OBRA (type = 'service', product_id = null)
    //           ['service', null, qty, unit_price, 'descripción del servicio'],
    //           // línea de PRODUCTO  (type = 'product', product_name para buscar en DB)
    //           ['product', 'Nombre exacto del producto', qty, unit_price, null|'nota'],
    //       ],
    //   ]
    // ─────────────────────────────────────────────────────────────

    private const PACKAGES = [

        // ══ PREVENTIVO ════════════════════════════════════════════

        'Cambio de Aceite — Mineral' => [
            'service_type' => 'Preventivo',
            'description'  => 'Cambio de aceite mineral 20W-50 con filtro de aceite. Ideal para vehículos con alto kilometraje.',
            'sort_order'   => 1,
            'items' => [
                ['service', null,                                   1.0,  35.00, 'Mano de obra: drenaje, relleno y reseteo de intervalo'],
                ['product', 'Castrol GTX 20W-50 Mineral 1L',        4.0,  15.00, 'Aceite mineral 20W-50'],
                ['product', 'Filtro de Aceite Bosch Universal',      1.0,  15.00, null],
            ],
        ],

        'Cambio de Aceite — Semi-Sintético' => [
            'service_type' => 'Preventivo',
            'description'  => 'Cambio de aceite semi-sintético 10W-40 con filtro de aceite. Para vehículos con kilometraje moderado.',
            'sort_order'   => 2,
            'items' => [
                ['service', null,                                   1.0,  35.00, 'Mano de obra: drenaje, relleno y reseteo de intervalo'],
                ['product', 'Castrol Magnatec 10W-40 Semi 1L',      4.0,  23.00, 'Aceite semi-sintético 10W-40'],
                ['product', 'Filtro de Aceite Bosch Universal',      1.0,  15.00, null],
            ],
        ],

        'Cambio de Aceite — Sintético' => [
            'service_type' => 'Preventivo',
            'description'  => 'Cambio de aceite sintético 5W-30 con filtro de aceite. Máxima protección para motores modernos.',
            'sort_order'   => 3,
            'items' => [
                ['service', null,                                   1.0,  35.00, 'Mano de obra: drenaje, relleno y reseteo de intervalo'],
                ['product', 'Castrol Edge 5W-30 Sintético 1L',      4.0,  35.00, 'Aceite sintético 5W-30'],
                ['product', 'Filtro de Aceite Bosch Premium',        1.0,  20.00, null],
            ],
        ],

        'Mantenimiento 5,000 km' => [
            'service_type' => 'Preventivo',
            'description'  => 'Mantenimiento básico: aceite + filtro de aceite + filtro de aire + revisión de niveles.',
            'sort_order'   => 4,
            'items' => [
                ['service', null,                                   1.0,  50.00, 'Mano de obra: cambio de aceite, filtros y revisión de niveles'],
                ['product', 'Mobil Super 10W-40 Semi-Sint. 1L',     4.0,  22.00, 'Aceite semi-sintético 10W-40'],
                ['product', 'Filtro de Aceite Bosch Universal',      1.0,  15.00, null],
                ['product', 'Filtro de Aire Bosch Universal',        1.0,  18.00, null],
            ],
        ],

        'Mantenimiento 10,000 km' => [
            'service_type' => 'Preventivo',
            'description'  => 'Mantenimiento intermedio: aceite sint. + filtro aceite + filtro aire + filtro combustible + bujías estándar.',
            'sort_order'   => 5,
            'items' => [
                ['service', null,                                   1.0,  80.00, 'Mano de obra: cambio de aceite, filtros y bujías'],
                ['product', 'Mobil 1 5W-30 Sintético 1L',           4.0,  32.00, 'Aceite sintético 5W-30'],
                ['product', 'Filtro de Aceite Bosch Universal',      1.0,  15.00, null],
                ['product', 'Filtro de Aire Bosch Universal',        1.0,  18.00, null],
                ['product', 'Filtro de Combustible Bosch',           1.0,  22.00, null],
                ['product', 'Filtro de Habitáculo Bosch',            1.0,  16.00, null],
                ['product', 'Bujía NGK Estándar BP6ES',              4.0,   9.50, 'Juego de 4 bujías estándar'],
            ],
        ],

        'Mantenimiento 20,000 km' => [
            'service_type' => 'Preventivo',
            'description'  => 'Mantenimiento completo: aceite sint. + todos los filtros + bujías de platino + correa de alternador.',
            'sort_order'   => 6,
            'items' => [
                ['service', null,                                   1.0, 120.00, 'Mano de obra: cambio de aceite, filtros, bujías y correa'],
                ['product', 'Shell Helix Ultra 5W-40 Sint. 1L',     4.0,  37.00, 'Aceite sintético 5W-40'],
                ['product', 'Filtro de Aceite Bosch Universal',      1.0,  15.00, null],
                ['product', 'Filtro de Aire Mann C27006',            1.0,  17.00, null],
                ['product', 'Filtro de Combustible Mann WK84',       1.0,  20.00, null],
                ['product', 'Filtro de Habitáculo Mann CU27',        1.0,  15.50, null],
                ['product', 'Bujía NGK Platino PFR6B',               4.0,  22.00, 'Juego de 4 bujías de platino'],
                ['product', 'Correa de Alternador Gates K050325',    1.0,  33.00, null],
            ],
        ],

        'Mantenimiento 40,000 km — Premium' => [
            'service_type' => 'Preventivo',
            'description'  => 'Mantenimiento mayor: todos los filtros + aceite sint. + bujías de iridio + correa distribución.',
            'sort_order'   => 7,
            'items' => [
                ['service', null,                                   1.0, 200.00, 'Mano de obra: mantenimiento completo 40,000 km'],
                ['product', 'Mobil 1 5W-30 Sintético 4L',           1.0, 115.00, 'Aceite sintético 5W-30 (juego de 4L)'],
                ['product', 'Filtro de Aceite Bosch Premium',        1.0,  20.00, null],
                ['product', 'Filtro de Aire Bosch Universal',        1.0,  18.00, null],
                ['product', 'Filtro de Combustible Bosch',           1.0,  22.00, null],
                ['product', 'Filtro de Habitáculo Bosch',            1.0,  16.00, null],
                ['product', 'Bujía NGK Iridio ILFR6B',              4.0,  33.00, 'Juego de 4 bujías de iridio'],
                ['product', 'Kit Distribución Gates K015607XS',      1.0, 170.00, 'Kit completo: correa + tensor + rodillo'],
            ],
        ],

        // ══ CORRECTIVO ════════════════════════════════════════════

        'Servicio de Frenos Delanteros' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo de pastillas de freno delanteras con inspección de discos.',
            'sort_order'   => 10,
            'items' => [
                ['service', null,                                   1.0,  50.00, 'Mano de obra: desmontaje, montaje y sangrado'],
                ['product', 'Pastillas Freno Delanteras Bendix',    1.0,  65.00, 'Juego de pastillas delanteras'],
                ['product', 'Líquido de Frenos DOT 4 500ml',        1.0,  15.00, 'Para purga del sistema'],
            ],
        ],

        'Servicio de Frenos Traseros' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo de pastillas de freno traseras con inspección de discos.',
            'sort_order'   => 11,
            'items' => [
                ['service', null,                                   1.0,  50.00, 'Mano de obra: desmontaje, montaje y sangrado'],
                ['product', 'Pastillas Freno Traseras Bendix',      1.0,  55.00, 'Juego de pastillas traseras'],
                ['product', 'Líquido de Frenos DOT 4 500ml',        1.0,  15.00, 'Para purga del sistema'],
            ],
        ],

        'Servicio de Frenos Completo' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo de pastillas delanteras y traseras, purga de líquido de frenos.',
            'sort_order'   => 12,
            'items' => [
                ['service', null,                                   1.0,  90.00, 'Mano de obra: frenos delanteros y traseros + sangrado completo'],
                ['product', 'Pastillas Freno Delanteras ATE',       1.0,  70.00, 'Juego delantero'],
                ['product', 'Pastillas Freno Traseras ATE',         1.0,  60.00, 'Juego trasero'],
                ['product', 'Líquido de Frenos ATE DOT 4 1L',       1.0,  22.00, null],
            ],
        ],

        'Cambio de Discos y Pastillas Delanteros' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo completo de discos y pastillas de freno delanteros.',
            'sort_order'   => 13,
            'items' => [
                ['service', null,                                   1.0, 100.00, 'Mano de obra: desmontaje y montaje de discos y pastillas'],
                ['product', 'Disco de Freno Delantero Bendix',      2.0, 120.00, 'Par de discos delanteros'],
                ['product', 'Pastillas Freno Delanteras Bendix',    1.0,  65.00, 'Juego de pastillas'],
                ['product', 'Líquido de Frenos DOT 4 500ml',        1.0,  15.00, null],
            ],
        ],

        'Cambio de Correa de Distribución' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo de correa de distribución con tensor y polea. Incluye cambio de refrigerante.',
            'sort_order'   => 14,
            'items' => [
                ['service', null,                                   1.0, 180.00, 'Mano de obra: desmontaje de accesorios, montaje y sincronización'],
                ['product', 'Kit Distribución Gates K015607XS',     1.0, 170.00, 'Kit: correa + tensor + rodillo'],
                ['product', 'Refrigerante Prestone All Vehicles 1L', 2.0,  25.00, 'Refrigerante para reposición'],
            ],
        ],

        'Cambio de Amortiguadores Delanteros' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo del par de amortiguadores delanteros. Se recomienda cambiar en par.',
            'sort_order'   => 15,
            'items' => [
                ['service', null,                                   1.0, 100.00, 'Mano de obra: desmontaje y montaje de amortiguadores delanteros'],
                ['product', 'Amortiguador Delantero Monroe Gas-Magnum', 2.0, 170.00, 'Par de amortiguadores delanteros'],
                ['product', 'Grasa Multipropósito 1Kg',             0.5,  40.00, 'Para lubricación de monturas'],
            ],
        ],

        'Cambio de Amortiguadores Traseros' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo del par de amortiguadores traseros. Se recomienda cambiar en par.',
            'sort_order'   => 16,
            'items' => [
                ['service', null,                                   1.0,  90.00, 'Mano de obra: desmontaje y montaje de amortiguadores traseros'],
                ['product', 'Amortiguador Trasero Monroe Gas-Magnum', 2.0, 152.00, 'Par de amortiguadores traseros'],
                ['product', 'Grasa Multipropósito 1Kg',             0.5,  40.00, 'Para lubricación de monturas'],
            ],
        ],

        'Cambio de Correa de Alternador' => [
            'service_type' => 'Correctivo',
            'description'  => 'Reemplazo de la correa de alternador / serpentín. Incluye revisión de tensor.',
            'sort_order'   => 17,
            'items' => [
                ['service', null,                                   1.0,  40.00, 'Mano de obra: cambio de correa de alternador'],
                ['product', 'Correa de Alternador Gates K050325',   1.0,  33.00, null],
            ],
        ],

        'Limpieza de Inyectores' => [
            'service_type' => 'Correctivo',
            'description'  => 'Limpieza química de inyectores con aditivo. Mejora consumo y respuesta del motor.',
            'sort_order'   => 18,
            'items' => [
                ['service', null,                                   1.0,  40.00, 'Mano de obra: limpieza de inyectores con máquina ultrasónica'],
                ['product', 'Limpiador de Inyectores Liqui Moly 300ml', 1.0, 33.00, null],
                ['product', 'STP Limpiador Inyectores 155ml',       1.0,  21.00, 'Aditivo adicional para el depósito'],
            ],
        ],

        'Purga y Cambio de Refrigerante' => [
            'service_type' => 'Correctivo',
            'description'  => 'Vaciado, limpieza y reposición del refrigerante del motor.',
            'sort_order'   => 19,
            'items' => [
                ['service', null,                                   1.0,  50.00, 'Mano de obra: vaciado, limpieza y llenado del sistema de refrigeración'],
                ['product', 'Anticongelante Prestone 50/50 1L',     3.0,  27.00, '3 litros para la mayoría de vehículos'],
                ['product', 'Flush Radiador Prestone 325ml',        1.0,  18.00, 'Limpiador interno del radiador'],
            ],
        ],

        // ══ DIAGNÓSTICO ═══════════════════════════════════════════

        'Diagnóstico con Escáner OBD2' => [
            'service_type' => 'Diagnóstico',
            'description'  => 'Lectura de códigos de falla con escáner multimarca. Incluye reporte impreso de diagnóstico.',
            'sort_order'   => 20,
            'items' => [
                ['service', null,                                   1.0,  60.00, 'Lectura de códigos de falla y borrado condicional'],
                ['service', null,                                   1.0,  20.00, 'Emisión de reporte de diagnóstico impreso'],
            ],
        ],

        'Diagnóstico General del Vehículo' => [
            'service_type' => 'Diagnóstico',
            'description'  => 'Revisión integral del vehículo con informe detallado del estado de todos los sistemas.',
            'sort_order'   => 21,
            'items' => [
                ['service', null,                                   1.0, 100.00, 'Diagnóstico completo: motor, frenos, suspensión y eléctrico'],
                ['service', null,                                   1.0,  30.00, 'Emisión de informe detallado con recomendaciones'],
            ],
        ],

        'Diagnóstico de Frenos' => [
            'service_type' => 'Diagnóstico',
            'description'  => 'Evaluación del estado del sistema de frenos: pastillas, discos, líquido y cilindros.',
            'sort_order'   => 22,
            'items' => [
                ['service', null,                                   1.0,  45.00, 'Diagnóstico de sistema de frenos con medición de espesores'],
            ],
        ],

        'Diagnóstico de Suspensión' => [
            'service_type' => 'Diagnóstico',
            'description'  => 'Evaluación del estado de amortiguadores, rótulas y terminales de dirección.',
            'sort_order'   => 23,
            'items' => [
                ['service', null,                                   1.0,  50.00, 'Diagnóstico de suspensión con prueba dinámica en rampa'],
            ],
        ],

        // ══ ELÉCTRICO ═════════════════════════════════════════════

        'Revisión y Prueba de Batería' => [
            'service_type' => 'Eléctrico',
            'description'  => 'Prueba de carga y estado de la batería. Si la capacidad es inferior al 70 %, se recomienda reemplazo.',
            'sort_order'   => 30,
            'items' => [
                ['service', null,                                   1.0,  25.00, 'Prueba de carga con equipo de diagnóstico de batería'],
            ],
        ],

        'Cambio de Batería 60Ah' => [
            'service_type' => 'Eléctrico',
            'description'  => 'Reemplazo de batería 12V 60Ah. Incluye prueba del alternador y limpieza de bornes.',
            'sort_order'   => 31,
            'items' => [
                ['service', null,                                   1.0,  25.00, 'Mano de obra: desmontaje, montaje y prueba post-instalación'],
                ['product', 'Batería Bosch S4 60Ah 12V',            1.0, 320.00, null],
            ],
        ],

        'Cambio de Batería 45Ah' => [
            'service_type' => 'Eléctrico',
            'description'  => 'Reemplazo de batería 12V 45Ah para vehículos pequeños. Incluye limpieza de bornes.',
            'sort_order'   => 32,
            'items' => [
                ['service', null,                                   1.0,  25.00, 'Mano de obra: desmontaje, montaje y prueba post-instalación'],
                ['product', 'Batería Bosch S3 45Ah 12V',            1.0, 250.00, null],
            ],
        ],

        'Revisión Sistema Eléctrico Completo' => [
            'service_type' => 'Eléctrico',
            'description'  => 'Diagnóstico del sistema eléctrico: batería, alternador, arranque, fusibles y cableado.',
            'sort_order'   => 33,
            'items' => [
                ['service', null,                                   1.0,  80.00, 'Diagnóstico eléctrico completo con multímetro y escáner'],
                ['service', null,                                   1.0,  20.00, 'Reporte de estado eléctrico del vehículo'],
            ],
        ],

        // ══ LATONERÍA Y PINTURA ════════════════════════════════════

        'Pulido y Encerado — Vehículo Pequeño' => [
            'service_type' => 'Latonería y Pintura',
            'description'  => 'Pulido a máquina y encerado con cera de carnauba para vehículos pequeños (hatchback/sedán).',
            'sort_order'   => 40,
            'items' => [
                ['service', null,                                   1.0, 120.00, 'Mano de obra: lavado, arcilla, pulido a máquina y encerado'],
                ['product', 'Cera 3M Paste Wax 311g',               1.0,  40.00, null],
                ['product', 'Limpiador Plásticos 3M 400ml',         1.0,  27.00, 'Para plásticos interiores y exteriores'],
            ],
        ],

        'Pulido y Encerado — SUV / Station Wagon' => [
            'service_type' => 'Latonería y Pintura',
            'description'  => 'Pulido a máquina y encerado para vehículos de mayor tamaño (SUV, pickup, station wagon).',
            'sort_order'   => 41,
            'items' => [
                ['service', null,                                   1.0, 180.00, 'Mano de obra: lavado, arcilla, pulido a máquina y encerado'],
                ['product', 'Cera 3M Paste Wax 311g',               1.0,  40.00, null],
                ['product', 'Limpiador Plásticos 3M 400ml',         1.0,  27.00, null],
                ['product', 'Silicona 3M Spray 400ml',              1.0,  25.00, 'Para protección de partes de goma'],
            ],
        ],

        'Desengrasado de Motor' => [
            'service_type' => 'Latonería y Pintura',
            'description'  => 'Limpieza profunda del compartimento motor con desengrasante y agua a presión.',
            'sort_order'   => 42,
            'items' => [
                ['service', null,                                   1.0,  60.00, 'Mano de obra: protección de componentes eléctricos, desengrasado y secado'],
                ['product', 'Limpiador Motor Desengrasante 3M 500ml', 1.0, 23.00, null],
                ['product', 'WD-40 Multiuso Aerosol 360ml',         1.0,  18.50, 'Lubricación post-limpieza de conectores y bisagras'],
            ],
        ],
    ];

    public function run(): void
    {
        $this->command->info('  → Creando tipos de servicio…');
        $this->seedServiceTypes();

        $this->command->info('  → Creando paquetes de servicio con ítems…');
        $this->seedPackages();

        $pkgCount  = ServicePackage::count();
        $itemCount = ServicePackageItem::count();
        $this->command->info("     ✓ {$pkgCount} paquetes · {$itemCount} ítems registrados");
    }

    // ─────────────────────────────────────────────────────────────

    private function seedServiceTypes(): void
    {
        foreach (self::SERVICE_TYPES as [$name, $description]) {
            ServiceType::firstOrCreate(
                ['name' => $name],
                ['description' => $description, 'status' => 'active']
            );
        }
    }

    private function seedPackages(): void
    {
        // Precarga tipos y productos para evitar N+1 durante el seed
        $typeMap    = ServiceType::pluck('id', 'name');
        $productMap = Product::pluck('id', 'name');

        foreach (self::PACKAGES as $packageName => $config) {
            $typeId = $typeMap[$config['service_type']] ?? null;

            if ($typeId === null) {
                $this->command->warn("     ⚠ Tipo de servicio no encontrado: {$config['service_type']}");
                continue;
            }

            $package = ServicePackage::firstOrCreate(
                ['name' => $packageName],
                [
                    'description'    => $config['description'],
                    'service_type_id'=> $typeId,
                    'sort_order'     => $config['sort_order'],
                    'status'         => 'active',
                ]
            );

            // Solo crear ítems si el paquete fue recién creado (evitar duplicados)
            if ($package->wasRecentlyCreated) {
                foreach ($config['items'] as [$type, $productName, $qty, $unitPrice, $notes]) {
                    $productId = null;

                    if ($type === 'product') {
                        $productId = $productMap[$productName] ?? null;

                        if ($productId === null) {
                            $this->command->warn("       ⚠ Producto no encontrado: {$productName} (paquete: {$packageName})");
                        }
                    }

                    ServicePackageItem::create([
                        'service_package_id' => $package->id,
                        'type'               => $type,
                        'product_id'         => $productId,
                        'quantity'           => $qty,
                        'unit_price'         => $unitPrice,
                        'notes'              => $notes,
                    ]);
                }
            }
        }
    }
}
