<?php

namespace Database\Seeders;

use App\Models\InventoryBrand;
use App\Models\InventoryType;
use App\Models\Product;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Catálogo de inventario real para un taller automotriz.
     *
     * Estructura: 'Tipo' => [ 'MarcaX' => [ [nombre, precio_compra, precio_venta, stock], … ], … ]
     */
    private const CATALOG = [
        'Aceites de Motor' => [
            'Mobil' => [
                ['Mobil 1 5W-30 Sintético 1L',        18.00,  32.00, 40],
                ['Mobil Super 10W-40 Semi-Sint. 1L',   12.00,  22.00, 35],
                ['Mobil Super 20W-50 Mineral 1L',       9.00,  16.00, 50],
                ['Mobil 1 5W-30 Sintético 4L',         65.00, 115.00, 20],
                ['Mobil Super 10W-40 Semi-Sint. 4L',   45.00,  80.00, 18],
            ],
            'Castrol' => [
                ['Castrol Edge 5W-30 Sintético 1L',    20.00,  35.00, 38],
                ['Castrol Magnatec 10W-40 Semi 1L',    13.00,  23.00, 32],
                ['Castrol GTX 20W-50 Mineral 1L',       8.50,  15.00, 55],
                ['Castrol Edge 5W-30 Sintético 4L',    72.00, 125.00, 15],
                ['Castrol Magnatec 10W-40 Semi 4L',    48.00,  85.00, 12],
            ],
            'Valvoline' => [
                ['Valvoline Advanced 5W-30 Sint. 1L',  17.00,  30.00, 30],
                ['Valvoline MaxLife 10W-40 Semi 1L',   11.50,  20.00, 28],
                ['Valvoline 20W-50 Mineral 1L',         8.00,  14.50, 45],
                ['Valvoline Advanced 5W-30 Sint. 4L',  62.00, 108.00, 14],
            ],
            'Shell' => [
                ['Shell Helix Ultra 5W-40 Sint. 1L',   21.00,  37.00, 25],
                ['Shell Helix HX7 10W-40 Semi 1L',     13.50,  24.00, 30],
                ['Shell Helix HX3 20W-50 Min. 1L',      8.50,  15.00, 40],
                ['Shell Helix Ultra 5W-40 Sint. 4L',   78.00, 135.00, 10],
            ],
            'Total' => [
                ['Total Quartz 9000 5W-40 Sint. 1L',   19.00,  34.00, 22],
                ['Total Quartz 7000 10W-40 Semi 1L',   12.00,  21.00, 28],
                ['Total Quartz 3000 20W-50 Min. 1L',    7.50,  13.50, 38],
            ],
        ],

        'Filtros' => [
            'Bosch' => [
                ['Filtro de Aceite Bosch Universal',    8.00,  15.00, 60],
                ['Filtro de Aire Bosch Universal',     10.00,  18.00, 45],
                ['Filtro de Combustible Bosch',        12.00,  22.00, 30],
                ['Filtro de Habitáculo Bosch',          9.00,  16.00, 35],
                ['Filtro de Aceite Bosch Premium',     11.00,  20.00, 25],
            ],
            'Mann' => [
                ['Filtro de Aceite Mann W712',          7.50,  14.00, 55],
                ['Filtro de Aire Mann C27006',          9.50,  17.00, 40],
                ['Filtro de Combustible Mann WK84',    11.00,  20.00, 28],
                ['Filtro de Habitáculo Mann CU27',      8.50,  15.50, 32],
            ],
            'Fram' => [
                ['Filtro de Aceite Fram PH3600',        6.50,  12.00, 65],
                ['Filtro de Aire Fram CA7624',          8.50,  15.50, 42],
                ['Filtro de Combustible Fram G3727',   10.00,  18.50, 25],
                ['Filtro de Habitáculo Fram CF8392',    7.50,  13.50, 30],
            ],
            'WIX' => [
                ['Filtro de Aceite WIX 51334',          7.00,  13.00, 48],
                ['Filtro de Aire WIX 42071',            9.00,  16.50, 38],
                ['Filtro de Combustible WIX 33399',    10.50,  19.00, 22],
            ],
        ],

        'Frenos' => [
            'Bendix' => [
                ['Pastillas Freno Delanteras Bendix',  35.00,  65.00, 25],
                ['Pastillas Freno Traseras Bendix',    30.00,  55.00, 22],
                ['Disco de Freno Delantero Bendix',    65.00, 120.00, 15],
                ['Disco de Freno Trasero Bendix',      58.00, 105.00, 12],
                ['Líquido de Frenos DOT 4 500ml',       8.00,  15.00, 40],
            ],
            'ATE' => [
                ['Pastillas Freno Delanteras ATE',     38.00,  70.00, 20],
                ['Pastillas Freno Traseras ATE',       33.00,  60.00, 18],
                ['Disco de Freno Delantero ATE',       72.00, 130.00, 12],
                ['Líquido de Frenos ATE DOT 4 1L',     12.00,  22.00, 30],
            ],
            'Brembo' => [
                ['Pastillas Freno Delanteras Brembo',  55.00, 100.00, 15],
                ['Pastillas Freno Traseras Brembo',    48.00,  88.00, 12],
                ['Disco de Freno Delantero Brembo',    95.00, 175.00,  8],
                ['Disco de Freno Trasero Brembo',      85.00, 155.00,  6],
            ],
            'Raybestos' => [
                ['Pastillas Freno Delanteras Raybestos', 32.00, 60.00, 18],
                ['Pastillas Freno Traseras Raybestos',   28.00, 52.00, 16],
                ['Disco de Freno Delantero Raybestos',   60.00, 110.00, 10],
            ],
        ],

        'Bujías' => [
            'NGK' => [
                ['Bujía NGK Estándar BP6ES',            5.00,   9.50, 80],
                ['Bujía NGK Platino PFR6B',            12.00,  22.00, 50],
                ['Bujía NGK Iridio ILFR6B',            18.00,  33.00, 40],
                ['Bujía NGK Doble Iridio ILZKR7B',     22.00,  40.00, 30],
                ['Bujía NGK Resistencia BPR6ES',        6.00,  11.00, 60],
            ],
            'Denso' => [
                ['Bujía Denso Estándar W20EPR-U',       5.50,  10.00, 70],
                ['Bujía Denso Platino PT16EPR-L13',    13.00,  23.50, 45],
                ['Bujía Denso Iridio SK16PR-A8',       19.00,  34.00, 35],
                ['Bujía Denso Doble Iridio IKH16TT',   24.00,  43.00, 25],
            ],
            'Bosch' => [
                ['Bujía Bosch Super FR7DCX',            5.50,  10.00, 65],
                ['Bujía Bosch Platino FR7MPP33',       13.50,  24.00, 42],
                ['Bujía Bosch Iridio FGR7DQI',         20.00,  36.00, 32],
            ],
            'Champion' => [
                ['Bujía Champion Estándar RC9YC',       4.50,   8.50, 75],
                ['Bujía Champion Platino 9804',        11.00,  20.00, 48],
                ['Bujía Champion Iridio 9403',         16.00,  29.00, 35],
            ],
        ],

        'Lubricantes y Aditivos' => [
            'Liqui Moly' => [
                ['Limpiador de Inyectores Liqui Moly 300ml', 18.00,  33.00, 30],
                ['Aditivo Motor Protect Liqui Moly 300ml',   22.00,  40.00, 25],
                ['Aceite Transmisión ATF III 1L',            24.00,  43.00, 20],
                ['Aceite Dirección Hidráulica 1L',           18.00,  32.00, 18],
                ['Radiator Stop Leak 150ml',                  12.00,  22.00, 22],
            ],
            'WD-40' => [
                ['WD-40 Multiuso Aerosol 360ml',             10.00,  18.50, 50],
                ['WD-40 Multiuso Aerosol 450ml',             13.00,  24.00, 40],
                ['WD-40 Specialist Anti-Corrosión 300ml',    15.00,  28.00, 25],
                ['WD-40 Specialist Lubricante Seco 300ml',   16.00,  29.00, 20],
            ],
            'Bardahl' => [
                ['Bardahl Tratamiento Motor 300ml',          15.00,  27.00, 28],
                ['Bardahl Limpiador Carburador 300ml',       12.00,  22.00, 32],
                ['Bardahl Anticongelante Verde 1L',          14.00,  25.00, 22],
                ['Bardahl Radiator Flush 300ml',              9.00,  16.00, 30],
            ],
            'Motul' => [
                ['Motul 300V Factory Line 5W-40 1L',         45.00,  82.00, 15],
                ['Motul 8100 X-max 0W-40 1L',                38.00,  68.00, 18],
                ['Motul Gear 300 75W-90 1L',                 32.00,  58.00, 14],
                ['Motul RBF 600 Brake Fluid 500ml',          22.00,  40.00, 20],
            ],
        ],

        'Refrigeración y Limpieza' => [
            'Prestone' => [
                ['Refrigerante Prestone All Vehicles 1L',   14.00,  25.00, 35],
                ['Refrigerante Prestone Extended Life 1L',  16.00,  29.00, 28],
                ['Anticongelante Prestone 50/50 1L',        15.00,  27.00, 25],
                ['Líquido Limpiaparabrisas Prestone 1L',     8.00,  14.00, 45],
                ['Flush Radiador Prestone 325ml',            10.00,  18.00, 30],
            ],
            'Peak' => [
                ['Refrigerante Peak Original 1L',           12.00,  22.00, 30],
                ['Anticongelante Peak Long Life 1L',        14.00,  25.00, 25],
                ['Limpiaparabrisas Peak 1L',                 7.00,  13.00, 40],
            ],
            '3M' => [
                ['Cera 3M Paste Wax 311g',                  22.00,  40.00, 20],
                ['Limpiador Plásticos 3M 400ml',            15.00,  27.00, 18],
                ['Silicona 3M Spray 400ml',                 14.00,  25.00, 22],
                ['Limpiador Motor Desengrasante 3M 500ml',  13.00,  23.00, 25],
            ],
            'STP' => [
                ['STP Tratamiento Gasolina 155ml',          10.00,  18.00, 35],
                ['STP Limpiador Inyectores 155ml',          12.00,  21.00, 30],
                ['STP Aceite Motor Alto Kilometraje 296ml', 13.00,  23.00, 25],
            ],
        ],

        'Repuestos Eléctricos' => [
            'Bosch' => [
                ['Batería Bosch S4 60Ah 12V',              185.00, 320.00,  8],
                ['Batería Bosch S3 45Ah 12V',              145.00, 250.00, 10],
                ['Alternador Bosch Universal 70A',         180.00, 320.00,  5],
                ['Motor de Arranque Bosch Universal',      165.00, 295.00,  5],
                ['Bobina de Encendido Bosch',               55.00,  98.00, 12],
            ],
            'Delphi' => [
                ['Sensor MAP Delphi Universal',             32.00,  58.00, 15],
                ['Sensor TPS Delphi Universal',             38.00,  68.00, 12],
                ['Sensor Lambda O2 Delphi Universal',       45.00,  82.00, 10],
                ['Bomba de Combustible Delphi Universal',   95.00, 170.00,  8],
            ],
            'ACDelco' => [
                ['Batería ACDelco Advantage 60Ah',         175.00, 310.00,  7],
                ['Batería ACDelco Gold 55Ah',               158.00, 280.00,  8],
                ['Bujía ACDelco Platino R44LTSM',           10.00,  18.50, 50],
                ['Bujía ACDelco Iridio 41-101',             18.00,  32.00, 35],
            ],
            'Denso' => [
                ['Alternador Denso 100A Reconstruido',     210.00, 375.00,  4],
                ['Motor de Arranque Denso Reconstruido',   185.00, 330.00,  4],
                ['Bobina Encendido Denso Universal',        48.00,  86.00, 10],
                ['Sensor Temperatura Refrigerante Denso',   22.00,  40.00, 15],
            ],
        ],

        'Correas y Cadenas' => [
            'Gates' => [
                ['Correa de Distribución Gates T234',      28.00,  52.00, 20],
                ['Correa de Alternador Gates K050325',     18.00,  33.00, 25],
                ['Correa de A/C Gates K030295',            20.00,  36.00, 22],
                ['Kit Distribución Gates K015607XS',       95.00, 170.00, 10],
                ['Tensor de Correa Gates T36080',          32.00,  58.00, 15],
            ],
            'Dayco' => [
                ['Correa de Distribución Dayco 94855',     25.00,  46.00, 18],
                ['Correa de Alternador Dayco 5PK1090',     16.00,  29.00, 22],
                ['Correa Serpentín Dayco 6PK1750',         22.00,  40.00, 18],
                ['Kit Distribución Dayco KTB399',          85.00, 152.00,  8],
            ],
            'Optibelt' => [
                ['Correa de Distribución Optibelt HP',     22.00,  40.00, 15],
                ['Correa de Alternador Optibelt RB',       14.00,  25.00, 20],
                ['Correa Micropoli Optibelt RBK',          19.00,  34.00, 16],
            ],
        ],

        'Suspensión y Dirección' => [
            'Monroe' => [
                ['Amortiguador Delantero Monroe Gas-Magnum', 95.00, 170.00,  8],
                ['Amortiguador Trasero Monroe Gas-Magnum',   85.00, 152.00,  8],
                ['Amortiguador Delantero Monroe OESpectrum',120.00, 215.00,  6],
                ['Amortiguador Trasero Monroe OESpectrum',  105.00, 188.00,  6],
            ],
            'KYB' => [
                ['Amortiguador Delantero KYB Excel-G',       88.00, 158.00,  8],
                ['Amortiguador Trasero KYB Excel-G',         78.00, 140.00,  8],
                ['Amortiguador Delantero KYB Gas-A-Just',   115.00, 205.00,  5],
                ['Amortiguador Trasero KYB Gas-A-Just',     100.00, 180.00,  5],
            ],
            'Moog' => [
                ['Terminal de Dirección Moog ES3497',        28.00,  50.00, 15],
                ['Rótula Inferior Moog K500045',             38.00,  68.00, 12],
                ['Punta de Eje Moog CV Joint',               75.00, 135.00,  8],
                ['Barra Estabilizadora Link Moog K700525',   22.00,  40.00, 18],
            ],
        ],
    ];

    public function run(): void
    {
        $this->command->info('  → Creando tipos, marcas y productos de inventario…');

        $totalTypes    = 0;
        $totalBrands   = 0;
        $totalProducts = 0;

        foreach (self::CATALOG as $typeName => $brandsCatalog) {
            $type = InventoryType::firstOrCreate(
                ['name' => $typeName],
                ['description' => "Categoría: {$typeName}", 'status' => 'active']
            );
            $totalTypes++;

            foreach ($brandsCatalog as $brandName => $products) {
                $brand = InventoryBrand::firstOrCreate(
                    ['inventory_type_id' => $type->id, 'name' => $brandName],
                    ['description' => "Marca {$brandName} — {$typeName}", 'status' => 'active']
                );
                $totalBrands++;

                foreach ($products as [$productName, $purchasePrice, $salePrice, $stock]) {
                    Product::firstOrCreate(
                        ['inventory_brand_id' => $brand->id, 'name' => $productName],
                        [
                            'description'    => null,
                            'purchase_price' => $purchasePrice,
                            'sale_price'     => $salePrice,
                            'stock'          => $stock,
                            'status'         => 'active',
                            'created_by_id'  => null,
                            'updated_by_id'  => null,
                        ]
                    );
                    $totalProducts++;
                }
            }
        }

        $this->command->info("     ✓ {$totalTypes} tipos · {$totalBrands} marcas · {$totalProducts} productos");
    }
}
