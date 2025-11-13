<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    /** @test */
    public function test_login_api_endpoint_returns_json_response()
    {
        $response = $this->postJson('/accounts/login', [
            'username' => 'test',
            'password' => 'test'
        ]);

        // Should return JSON response for API request
        $response->assertStatus(401)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors'
                 ]);
    }

    /** @test */
    public function test_signup_form_data_api_endpoint()
    {
        $response = $this->getJson('/accounts/signup');

        // Should return JSON response with form data for API request
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'contractor_types',
                         'occupations',
                         'valid_ids',
                         'provinces',
                         'picab_categories'
                     ]
                 ]);
    }

    /** @test */
    public function test_role_selection_api_endpoint()
    {
        $response = $this->postJson('/accounts/signup/select-role', [
            'user_type' => 'contractor'
        ]);

        // Should return JSON response for API request
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'user_type',
                     'next_step'
                 ]);
    }

    /** @test */
    public function test_provinces_api_endpoint()
    {
        $response = $this->getJson('/api/psgc/provinces');

        // Should return JSON response
        $response->assertStatus(200);
    }
}
