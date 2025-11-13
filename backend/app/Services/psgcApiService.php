<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class psgcApiService
{
    protected $baseUrl = 'https://psgc.gitlab.io/api';

    // Get all provinces
    public function getProvinces()
    {
        try {
            return Cache::remember('psgc_provinces', 86400, function () {
                $response = Http::get($this->baseUrl . '/provinces/');

                if ($response->successful()) {
                    $provinces = $response->json();
                    // Sort by name
                    usort($provinces, function($a, $b) {
                        return strcmp($a['name'], $b['name']);
                    });
                    return $provinces;
                }

                return $this->getFallbackProvinces();
            });
        } catch (\Exception $e) {
            return $this->getFallbackProvinces();
        }
    }

    // Get cities/municipalities by province code
    public function getCitiesByProvince($provinceCode)
    {
        try {
            return Cache::remember('psgc_cities_' . $provinceCode, 86400, function () use ($provinceCode) {
                $response = Http::get($this->baseUrl . '/provinces/' . $provinceCode . '/cities-municipalities/');

                if ($response->successful()) {
                    $cities = $response->json();
                    usort($cities, function($a, $b) {
                        return strcmp($a['name'], $b['name']);
                    });
                    return $cities;
                }

                return [];
            });
        } catch (\Exception $e) {
            return [];
        }
    }

    // Get barangays by city/municipality code
    public function getBarangaysByCity($cityCode)
    {
        try {
            return Cache::remember('psgc_barangays_' . $cityCode, 86400, function () use ($cityCode) {
                $response = Http::get($this->baseUrl . '/cities-municipalities/' . $cityCode . '/barangays/');

                if ($response->successful()) {
                    $barangays = $response->json();
                    usort($barangays, function($a, $b) {
                        return strcmp($a['name'], $b['name']);
                    });
                    return $barangays;
                }

                return [];
            });
        } catch (\Exception $e) {
            return [];
        }
    }

    // Fallback provinces if API fails
    private function getFallbackProvinces()
    {
        $provinces = [
            ['code' => '0128', 'name' => 'Ilocos Norte'],
            ['code' => '0129', 'name' => 'Ilocos Sur'],
            ['code' => '0133', 'name' => 'La Union'],
            ['code' => '0155', 'name' => 'Pangasinan'],
            ['code' => '0209', 'name' => 'Batanes'],
            ['code' => '0215', 'name' => 'Cagayan'],
            ['code' => '0231', 'name' => 'Isabela'],
            ['code' => '0250', 'name' => 'Nueva Vizcaya'],
            ['code' => '0257', 'name' => 'Quirino'],
            ['code' => '0314', 'name' => 'Bataan'],
            ['code' => '0321', 'name' => 'Bulacan'],
            ['code' => '0337', 'name' => 'Nueva Ecija'],
            ['code' => '0349', 'name' => 'Pampanga'],
            ['code' => '0354', 'name' => 'Tarlac'],
            ['code' => '0369', 'name' => 'Zambales'],
            ['code' => '0371', 'name' => 'Aurora'],
            ['code' => '0410', 'name' => 'Batangas'],
            ['code' => '0421', 'name' => 'Cavite'],
            ['code' => '0434', 'name' => 'Laguna'],
            ['code' => '0456', 'name' => 'Quezon'],
            ['code' => '0458', 'name' => 'Rizal'],
            ['code' => '0548', 'name' => 'Marinduque'],
            ['code' => '0517', 'name' => 'Occidental Mindoro'],
            ['code' => '0520', 'name' => 'Oriental Mindoro'],
            ['code' => '0541', 'name' => 'Palawan'],
            ['code' => '0559', 'name' => 'Romblon'],
            ['code' => '0605', 'name' => 'Albay'],
            ['code' => '0616', 'name' => 'Camarines Norte'],
            ['code' => '0619', 'name' => 'Camarines Sur'],
            ['code' => '0620', 'name' => 'Catanduanes'],
            ['code' => '0638', 'name' => 'Masbate'],
            ['code' => '0656', 'name' => 'Sorsogon'],
            ['code' => '0704', 'name' => 'Aklan'],
            ['code' => '0706', 'name' => 'Antique'],
            ['code' => '0719', 'name' => 'Capiz'],
            ['code' => '0730', 'name' => 'Iloilo'],
            ['code' => '0745', 'name' => 'Guimaras'],
            ['code' => '0746', 'name' => 'Negros Occidental'],
            ['code' => '0761', 'name' => 'Bohol'],
            ['code' => '0772', 'name' => 'Cebu'],
            ['code' => '0746', 'name' => 'Negros Oriental'],
            ['code' => '0852', 'name' => 'Siquijor'],
            ['code' => '0826', 'name' => 'Eastern Samar'],
            ['code' => '0837', 'name' => 'Leyte'],
            ['code' => '0848', 'name' => 'Northern Samar'],
            ['code' => '0860', 'name' => 'Samar'],
            ['code' => '0864', 'name' => 'Southern Leyte'],
            ['code' => '0878', 'name' => 'Biliran'],
            ['code' => '0972', 'name' => 'Zamboanga del Norte'],
            ['code' => '0973', 'name' => 'Zamboanga del Sur'],
            ['code' => '0983', 'name' => 'Zamboanga Sibugay'],
            ['code' => '1013', 'name' => 'Bukidnon'],
            ['code' => '1018', 'name' => 'Camiguin'],
            ['code' => '1035', 'name' => 'Lanao del Norte'],
            ['code' => '1042', 'name' => 'Misamis Occidental'],
            ['code' => '1043', 'name' => 'Misamis Oriental'],
            ['code' => '1123', 'name' => 'Davao de Oro'],
            ['code' => '1124', 'name' => 'Davao del Norte'],
            ['code' => '1125', 'name' => 'Davao del Sur'],
            ['code' => '1126', 'name' => 'Davao Occidental'],
            ['code' => '1182', 'name' => 'Davao Oriental'],
            ['code' => '1247', 'name' => 'Cotabato'],
            ['code' => '1263', 'name' => 'South Cotabato'],
            ['code' => '1265', 'name' => 'Sultan Kudarat'],
            ['code' => '1280', 'name' => 'Sarangani'],
            ['code' => '1298', 'name' => 'Cotabato City'],
            ['code' => '1339', 'name' => 'NCR, City of Manila'],
            ['code' => '1374', 'name' => 'Abra'],
            ['code' => '1401', 'name' => 'Benguet'],
            ['code' => '1427', 'name' => 'Ifugao'],
            ['code' => '1432', 'name' => 'Kalinga'],
            ['code' => '1444', 'name' => 'Mountain Province'],
            ['code' => '1481', 'name' => 'Apayao'],
            ['code' => '1507', 'name' => 'Basilan'],
            ['code' => '1512', 'name' => 'Lanao del Sur'],
            ['code' => '1536', 'name' => 'Maguindanao'],
            ['code' => '1566', 'name' => 'Sulu'],
            ['code' => '1570', 'name' => 'Tawi-Tawi'],
            ['code' => '1602', 'name' => 'Agusan del Norte'],
            ['code' => '1603', 'name' => 'Agusan del Sur'],
            ['code' => '1667', 'name' => 'Surigao del Norte'],
            ['code' => '1668', 'name' => 'Surigao del Sur'],
            ['code' => '1685', 'name' => 'Dinagat Islands']
        ];

        usort($provinces, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        return $provinces;
    }
}
