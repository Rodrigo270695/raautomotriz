<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);

        $response = $this->post(route('register.store'), [
            'first_name'            => 'Test',
            'last_name'             => 'User',
            'document_type'         => 'dni',
            'document_number'       => '12345678',
            'email'                 => 'test@example.com',
            'phone'                 => '987654321',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/dashboard');
    }
}
