<?php

namespace App\Services;

use GuzzleHttp\Client;

class RouteService
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = env('OPENROUTESERVICE_API_KEY');
    }

    public function calculateRoute($origin, $destination)
    {
        $response = $this->client->post('https://api.openrouteservice.org/v2/directions/driving-car', [
            'headers' => [
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'coordinates' => [
                    [$origin['lng'], $origin['lat']],
                    [$destination['lng'], $destination['lat']],
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return [
            'distancia_km' => $data['routes'][0]['summary']['distance'] / 1000, // Convertir a km
            'duracion_min' => ceil($data['routes'][0]['summary']['duration'] / 60), // Convertir a minutos
            'coordenadas' => $data['routes'][0]['geometry'], // GeoJSON
        ];
    }
}