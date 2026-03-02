<?php

use App\Models\InventoryBrand;
use App\Models\InventoryType;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

function makeProduct(array $attrs = []): Product
{
    $type = InventoryType::factory()->create(['status' => 'active']);
    $brand = InventoryBrand::factory()->create(['status' => 'active', 'inventory_type_id' => $type->id]);

    return Product::factory()->create(array_merge([
        'inventory_brand_id' => $brand->id,
        'status' => 'active',
    ], $attrs));
}

it('devuelve todos los productos sin filtros', function () {
    makeProduct(['name' => 'Aceite Motor']);
    makeProduct(['name' => 'Filtro Aire']);

    $repo = new ProductRepository;
    $request = Request::create('/');

    $results = $repo->filteredQuery($request)->get();

    expect($results)->toHaveCount(2);
});

it('filtra por nombre con búsqueda', function () {
    makeProduct(['name' => 'Aceite Motor 5W30']);
    makeProduct(['name' => 'Filtro Aceite']);
    makeProduct(['name' => 'Pastillas Freno']);

    $repo = new ProductRepository;
    $request = Request::create('/', 'GET', ['search' => 'aceite']);

    $results = $repo->filteredQuery($request)->get();

    expect($results)->toHaveCount(2);
});

it('filtra solo productos activos', function () {
    makeProduct(['name' => 'Activo', 'status' => 'active']);
    makeProduct(['name' => 'Inactivo', 'status' => 'inactive']);

    $repo = new ProductRepository;
    $request = Request::create('/', 'GET', ['filter_status' => 'active']);

    $results = $repo->filteredQuery($request)->get();

    expect($results)->toHaveCount(1);
    expect($results->first()->status)->toBe('active');
});

it('filtra solo productos inactivos', function () {
    makeProduct(['name' => 'Activo', 'status' => 'active']);
    makeProduct(['name' => 'Inactivo', 'status' => 'inactive']);

    $repo = new ProductRepository;
    $request = Request::create('/', 'GET', ['filter_status' => 'inactive']);

    $results = $repo->filteredQuery($request)->get();

    expect($results)->toHaveCount(1);
    expect($results->first()->status)->toBe('inactive');
});

it('ordena por nombre por defecto', function () {
    makeProduct(['name' => 'Zumo']);
    makeProduct(['name' => 'Aceite']);
    makeProduct(['name' => 'Motor']);

    $repo = new ProductRepository;
    $request = Request::create('/');

    $results = $repo->filteredQuery($request)->get();

    expect($results->pluck('name')->toArray())->toBe(['Aceite', 'Motor', 'Zumo']);
});
