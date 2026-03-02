<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $docNumber = fake()->unique()->numerify('########');

        return [
            'first_name'                => fake()->firstName(),
            'last_name'                 => fake()->lastName(),
            'document_type'             => fake()->randomElement(['dni', 'ce', 'pasaporte']),
            'document_number'           => $docNumber,
            'username'                  => fake()->unique()->userName(),
            'phone'                     => '9' . fake()->numerify('########'),
            'status'                    => 'active',
            'email'                     => fake()->unique()->safeEmail(),
            'email_verified_at'         => now(),
            'password'                  => static::$password ??= Hash::make('password'),
            'remember_token'            => Str::random(10),
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,
        ];
    }

    /**
     * Usuario con rol cliente: DNI como número y username, teléfono peruano.
     */
    public function cliente(): static
    {
        $dni = fake()->unique()->numerify('########');

        return $this->state([
            'document_type'   => 'dni',
            'document_number' => $dni,
            'username'        => $dni,
            'phone'           => '9' . fake()->numerify('########'),
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret'         => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at'   => now(),
        ]);
    }
}
