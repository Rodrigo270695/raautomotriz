<?php

namespace Database\Seeders;

use App\Models\ServiceChecklist;
use Illuminate\Database\Seeder;

class ServiceChecklistSeeder extends Seeder
{
    /**
     * Lista completa de ítems de chequeo para recepción de vehículo.
     * Agrupados por sección; el order_number define el orden de aparición en el formulario.
     *
     * Formato: [order_number, nombre, descripción (null = sin descripción)]
     */
    private const ITEMS = [
        // ── MOTOR Y FLUIDOS ──────────────────────────────────────────────
        [1,  'Nivel de aceite de motor',                  'Verificar nivel con varilla; rellenar si es necesario.'],
        [2,  'Nivel de refrigerante',                     'Revisar depósito de expansión y radiador en frío.'],
        [3,  'Nivel de líquido de frenos',                'Verificar reservorio; nivel debe estar entre MIN y MAX.'],
        [4,  'Nivel de líquido de dirección hidráulica',  'Aplicable solo a vehículos con dirección hidráulica.'],
        [5,  'Nivel de líquido limpiaparabrisas',         'Revisar depósito y funcionamiento de los rociadores.'],
        [6,  'Fugas de aceite de motor',                  'Inspección visual de cárter, tapa de válvulas y sellos.'],
        [7,  'Fugas de refrigerante',                     'Inspección visual de mangueras, radiador y bomba de agua.'],
        [8,  'Estado de la correa de alternador',         'Verificar tensión, desgaste y posibles grietas.'],

        // ── FRENOS ───────────────────────────────────────────────────────
        [9,  'Pastillas de freno delanteras',             'Medir espesor del material de fricción.'],
        [10, 'Pastillas de freno traseras',               'Medir espesor del material de fricción.'],
        [11, 'Discos de freno delanteros',                'Revisar estrías, grietas y espesor mínimo.'],
        [12, 'Discos de freno traseros',                  'Revisar estrías, grietas y espesor mínimo.'],
        [13, 'Freno de estacionamiento (parking)',        'Verificar funcionamiento y recorrido de la palanca.'],
        [14, 'Líquido de frenos (color y nivel)',         'Líquido oscuro o bajo indica posible deterioro.'],

        // ── SUSPENSIÓN Y DIRECCIÓN ───────────────────────────────────────
        [15, 'Amortiguadores delanteros',                 'Prueba de botado y revisión visual de fugas de aceite.'],
        [16, 'Amortiguadores traseros',                   'Prueba de botado y revisión visual de fugas de aceite.'],
        [17, 'Rótulas de suspensión',                     'Verificar juego axial y radial con palanca.'],
        [18, 'Terminales de dirección (extremos de barra)', 'Revisar juego y estado de fuelle protector.'],
        [19, 'Juego en volante de dirección',             'Juego libre máximo permitido: 3–5 cm.'],
        [20, 'Fuelles y cremallera de dirección',         'Revisar presencia de grasa derramada; indica rotura del fuelle.'],

        // ── NEUMÁTICOS ───────────────────────────────────────────────────
        [21, 'Llanta delantera derecha',                  'Presión recomendada según etiqueta del vehículo; verificar desgaste.'],
        [22, 'Llanta delantera izquierda',                'Presión recomendada según etiqueta del vehículo; verificar desgaste.'],
        [23, 'Llanta trasera derecha',                    'Presión recomendada según etiqueta del vehículo; verificar desgaste.'],
        [24, 'Llanta trasera izquierda',                  'Presión recomendada según etiqueta del vehículo; verificar desgaste.'],
        [25, 'Llanta de repuesto',                        'Verificar presión y estado del neumático de emergencia.'],
        [26, 'Rines y tuercas de rueda',                  'Revisar golpes, deformaciones y par de apriete de tuercas.'],

        // ── SISTEMA ELÉCTRICO ────────────────────────────────────────────
        [27, 'Batería (estado y carga)',                  'Medición de voltaje en reposo: 12.4–12.7 V = OK.'],
        [28, 'Alternador (tensión de carga)',             'En marcha: 13.5–14.5 V = OK; indicar si está fuera de rango.'],
        [29, 'Luces delanteras (altas y bajas)',          'Verificar funcionamiento y orientación del haz.'],
        [30, 'Luces traseras y de freno',                 'Incluir tercer foco de freno si aplica.'],
        [31, 'Luces de reversa y posición',               'Revisar todas las luces perimetrales.'],
        [32, 'Intermitentes delanteros y traseros',       'Verificar frecuencia de parpadeo e intensidad.'],

        // ── MOTOR — SISTEMA DE ENCENDIDO ─────────────────────────────────
        [33, 'Bujías de encendido',                       'Inspección visual si se tiene acceso; verificar estado del electrodo.'],
        [34, 'Cables de bujías o bobinas de encendido',   'Revisar fisuras, mal contacto o desgaste.'],
        [35, 'Filtro de aire del motor',                  'Revisar colmatación; agitar o revisar indicador si lleva uno.'],

        // ── TRANSMISIÓN ──────────────────────────────────────────────────
        [36, 'Nivel de aceite de transmisión',            'Manual: revisar tapón lateral. Automática: dipstick en caliente.'],
        [37, 'Fugas de caja de cambios / diferencial',    'Inspección visual bajo el vehículo.'],
        [38, 'Estado de los semiejes y fuelles (4x2/4x4)', 'Revisar desgarro de fuelle y posible salida de grasa.'],

        // ── CARROCERÍA Y EXTERIOR ─────────────────────────────────────────
        [39, 'Parabrisas (fisuras o daños)',              'Indicar ubicación y tamaño de cualquier fisura.'],
        [40, 'Limpiaparabrisas (plumas y motor)',         'Verificar limpieza, presión y estado del caucho.'],
        [41, 'Espejos retrovisores',                      'Exterior e interior; estado del vidrio y mecanismo.'],
        [42, 'Estado general de carrocería',              'Registrar abolladuras, rayones o daños preexistentes.'],
        [43, 'Puertas, maletero y cofre (cierre)',        'Verificar pestillos, bisagras y sistema de cierre centralizado.'],

        // ── INTERIOR Y SEGURIDAD ──────────────────────────────────────────
        [44, 'Cinturones de seguridad',                   'Verificar funcionamiento del retractor y estado de la correa.'],
        [45, 'Testigos encendidos en tablero',            'Registrar si hay indicadores de falla activos al encender.'],
        [46, 'Aire acondicionado',                        'Verificar enfriamiento, olores extraños y funcionamiento del ventilador.'],
        [47, 'Bocina (claxon)',                           'Prueba de funcionamiento.'],
        [48, 'Tapicería, alfombras y techo interior',     'Registrar daños o manchas preexistentes.'],
    ];

    public function run(): void
    {
        $this->command->info('  → Creando ítems de lista de chequeo…');

        foreach (self::ITEMS as [$order, $name, $description]) {
            ServiceChecklist::firstOrCreate(
                ['name' => $name],
                [
                    'order_number' => $order,
                    'description'  => $description,
                    'status'       => 'active',
                ]
            );
        }

        $count = ServiceChecklist::count();
        $this->command->info("     ✓ {$count} ítems de checklist registrados");
    }
}
