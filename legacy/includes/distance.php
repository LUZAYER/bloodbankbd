<?php
/**
 * BloodLink - Location-Based Matching & Haversine Distance Calculation
 * Computes spherical great-circle distance between requester and donor coordinates.
 */

const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculate Haversine distance between two latitude/longitude points in kilometers.
 * Returns float distance in KM, or null if coordinates are invalid.
 */
function calculateHaversineDistance($lat1, $lon1, $lat2, $lon2) {
    if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) {
        return null;
    }
    
    $lat1 = (float) $lat1;
    $lon1 = (float) $lon1;
    $lat2 = (float) $lat2;
    $lon2 = (float) $lon2;
    
    // Validate coordinate ranges
    if ($lat1 < -90 || $lat1 > 90 || $lat2 < -90 || $lat2 > 90) return null;
    if ($lon1 < -180 || $lon1 > 180 || $lon2 < -180 || $lon2 > 180) return null;
    
    // Identical point
    if (abs($lat1 - $lat2) < 0.00001 && abs($lon1 - $lon2) < 0.00001) {
        return 0.1; // Minimal radius ~100 meters
    }
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
         
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = EARTH_RADIUS_KM * $c;
    
    return round($distance, 1);
}

/**
 * Resolve coordinates for a given user search string (e.g., "Wari, Dhaka", "Mirpur", "Chittagong")
 * Looks up in the database locations reference table.
 */
function resolveLocationCoordinates($locationString) {
    if (empty(trim($locationString))) {
        return null;
    }
    
    $clean = trim($locationString);
    // Split common separators
    $tokens = preg_split('/[,.\s]+/', strtolower($clean));
    
    // First try exact match in locations table
    $loc = dbQueryOne("SELECT * FROM locations WHERE LOWER(name) = ? LIMIT 1", [strtolower($clean)]);
    if ($loc) {
        return [
            'name'      => $loc['name'],
            'district'  => $loc['district'],
            'division'  => $loc['division'],
            'latitude'  => (float) $loc['latitude'],
            'longitude' => (float) $loc['longitude'],
            'matched'   => 'exact'
        ];
    }
    
    // Try matching individual tokens (e.g. "Wari" in "Wari, Dhaka")
    foreach ($tokens as $token) {
        if (strlen($token) < 3) continue;
        $loc = dbQueryOne("SELECT * FROM locations WHERE LOWER(name) = ? LIMIT 1", [$token]);
        if ($loc) {
            return [
                'name'      => $loc['name'],
                'district'  => $loc['district'],
                'division'  => $loc['division'],
                'latitude'  => (float) $loc['latitude'],
                'longitude' => (float) $loc['longitude'],
                'matched'   => 'token'
            ];
        }
    }
    
    // Try LIKE matching on district
    foreach ($tokens as $token) {
        if (strlen($token) < 3) continue;
        $loc = dbQueryOne("SELECT * FROM locations WHERE LOWER(district) LIKE ? LIMIT 1", ['%' . $token . '%']);
        if ($loc) {
            return [
                'name'      => $loc['name'],
                'district'  => $loc['district'],
                'division'  => $loc['division'],
                'latitude'  => (float) $loc['latitude'],
                'longitude' => (float) $loc['longitude'],
                'matched'   => 'district'
            ];
        }
    }
    
    return null;
}
