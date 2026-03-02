<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleModel>
 */
class VehicleModelFactory extends Factory
{
    /**
     * Catálogo de modelos reales agrupados por marca.
     * Usado en el VehicleSeeder para poblar con datos realistas.
     */
    public const MODELS_BY_BRAND = [
        'Toyota'        => ['Corolla', 'Hilux', 'RAV4', 'Yaris', 'Land Cruiser', 'Avanza', 'Fortuner', 'Rush', 'Prado', '4Runner'],
        'Hyundai'       => ['Tucson', 'Accent', 'Santa Fe', 'i10', 'Elantra', 'H1', 'Creta', 'Sonata', 'Venue', 'Ioniq'],
        'Kia'           => ['Sportage', 'Sorento', 'Rio', 'Cerato', 'Picanto', 'Stonic', 'Seltos', 'Carnival', 'Stinger', 'Telluride'],
        'Nissan'        => ['Frontier', 'X-Trail', 'Sentra', 'Patrol', 'Note', 'Kicks', 'Versa', 'Murano', 'Pathfinder', 'Navara'],
        'Honda'         => ['Civic', 'CR-V', 'Accord', 'HR-V', 'Pilot', 'City', 'Fit', 'Jazz', 'BR-V', 'WR-V'],
        'Mitsubishi'    => ['Outlander', 'Montero', 'L200', 'Eclipse Cross', 'ASX', 'Galant', 'Lancer', 'Pajero', 'Colt', 'Mirage'],
        'Chevrolet'     => ['Spark', 'Captiva', 'Trax', 'Aveo', 'Colorado', 'Traverse', 'Malibu', 'Equinox', 'Blazer', 'Tracker'],
        'Ford'          => ['Explorer', 'F-150', 'EcoSport', 'Escape', 'Ranger', 'Edge', 'Bronco', 'Expedition', 'Mustang', 'Maverick'],
        'Mazda'         => ['Mazda2', 'Mazda3', 'CX-5', 'CX-3', 'Mazda6', 'BT-50', 'CX-9', 'CX-30', 'MX-5', 'CX-50'],
        'Suzuki'        => ['Vitara', 'Swift', 'Jimny', 'Baleno', 'S-Cross', 'Ertiga', 'Grand Vitara', 'Alto', 'Ignis', 'Fronx'],
        'Volkswagen'    => ['Golf', 'Tiguan', 'Touareg', 'Polo', 'Jetta', 'Passat', 'Amarok', 'T-Roc', 'ID.4', 'Taos'],
        'Subaru'        => ['Forester', 'Outback', 'XV', 'Impreza', 'Legacy', 'BRZ', 'WRX', 'Ascent', 'Levorg', 'Crosstrek'],
        'Renault'       => ['Duster', 'Sandero', 'Logan', 'Koleos', 'Captur', 'Megane', 'Clio', 'Fluence', 'Kangoo', 'Oroch'],
        'Peugeot'       => ['208', '308', '3008', '5008', '2008', '408', 'Partner', 'Expert', 'Traveller', '508'],
        'Mercedes-Benz' => ['C-Class', 'E-Class', 'GLE', 'GLB', 'GLC', 'Sprinter', 'Vito', 'A-Class', 'S-Class', 'G-Class'],
        'BMW'           => ['Serie 3', 'Serie 5', 'X3', 'X5', 'X1', 'Serie 1', 'X6', 'X7', 'Serie 7', 'M3'],
        'Audi'          => ['A4', 'Q5', 'A3', 'Q3', 'A6', 'Q7', 'Q8', 'A5', 'e-tron', 'TT'],
        'Jeep'          => ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Commander', 'Avenger'],
        'Volvo'         => ['XC60', 'XC90', 'XC40', 'S60', 'V60', 'S90', 'V90', 'C40', 'EX40', 'EC40'],
        'Land Rover'    => ['Defender', 'Discovery', 'Range Rover', 'Freelander', 'Evoque', 'Sport', 'Velar'],
    ];

    /** Todos los modelos en una lista plana — para usar en el factory genérico. */
    private const ALL_MODELS = [
        'Corolla', 'Hilux', 'RAV4', 'Yaris', 'Fortuner', 'Avanza',
        'Tucson', 'Accent', 'Elantra', 'Santa Fe', 'Creta',
        'Sportage', 'Cerato', 'Rio', 'Picanto', 'Seltos',
        'Frontier', 'X-Trail', 'Sentra', 'Kicks', 'Versa',
        'Civic', 'CR-V', 'HR-V', 'City', 'Accord',
        'Outlander', 'Montero', 'L200', 'ASX', 'Lancer',
        'Spark', 'Trax', 'Captiva', 'Aveo', 'Colorado',
        'Ranger', 'EcoSport', 'Explorer', 'Escape', 'F-150',
        'Mazda3', 'CX-5', 'CX-3', 'Mazda2', 'BT-50',
        'Vitara', 'Swift', 'Jimny', 'Ertiga', 'S-Cross',
        'Golf', 'Tiguan', 'Polo', 'Jetta', 'Amarok',
        'Forester', 'Outback', 'XV', 'Impreza',
        'Duster', 'Sandero', 'Logan', 'Captur', 'Koleos',
        'XC60', 'XC40', 'XC90', 'Wrangler', 'Grand Cherokee',
    ];

    public function definition(): array
    {
        return [
            'brand_id'    => Brand::factory(),
            'name'        => $this->faker->unique()->randomElement(self::ALL_MODELS),
            'description' => $this->faker->optional(0.4)->sentence(),
            'status'      => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
