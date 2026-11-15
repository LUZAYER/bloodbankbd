<?php
/**
 * BloodLink - AI & Machine Learning PHP Integration Client
 * Connects PHP backend to Python NLP and Scikit-Learn ML ranking services.
 * Features automatic three-tier resilience:
 *   Tier 1: Flask Microservice HTTP API (Fastest)
 *   Tier 2: Direct Python CLI Process Execution
 *   Tier 3: Built-in Native PHP Rule-Based Engine (Zero dependency fallback)
 */

define('FLASK_API_BASE_URL', 'http://127.0.0.1:5000');
define('PYTHON_PATH_DEFAULT', 'python');

/**
 * Locate python executable across system paths or local portable tools
 */
function getPythonExecutable() {
    static $pyPath = null;
    if ($pyPath !== null) return $pyPath;

    $candidates = [
        'C:/Users/Rafi/.tools/python/python.exe',
        'python',
        'python3',
        'C:/xampp/python/python.exe',
        'C:/Python311/python.exe',
        'C:/Program Files/Python311/python.exe'
    ];

    foreach ($candidates as $cand) {
        if (strpos($cand, '/') !== false || strpos($cand, '\\') !== false) {
            if (file_exists($cand)) {
                $pyPath = $cand;
                return $pyPath;
            }
        }
    }

    $pyPath = 'python';
    return $pyPath;
}

/**
 * Natural Language Query Parser (Feature 1)
 */
function parseNaturalLanguageQuery($queryText) {
    if (empty(trim($queryText))) {
        return [
            'blood_group'             => null,
            'district'                => null,
            'city_area'               => null,
            'urgency'                 => 'Normal',
            'availability_preference' => false,
            'raw_location'            => ''
        ];
    }

    // Tier 1: Try Flask API
    $apiResult = callFlaskApi('/api/parse_query', ['query' => $queryText], 'POST', 0.8);
    if ($apiResult && !empty($apiResult['success']) && !empty($apiResult['filters'])) {
        return $apiResult['filters'];
    }

    // Tier 2: Try Python CLI
    $py = getPythonExecutable();
    $script = dirname(__DIR__) . '/ml/nlp_parser.py';
    if (file_exists($script)) {
        $escaped = escapeshellarg($queryText);
        $cmd = "\"{$py}\" \"{$script}\" {$escaped}";
        $output = @shell_exec($cmd);
        if ($output) {
            $json = json_decode($output, true);
            if (is_array($json) && isset($json['blood_group'])) {
                return $json;
            }
        }
    }

    // Tier 3: Native PHP Fallback NLP
    return nativePhpNlpParser($queryText);
}

/**
 * ML-Based Donor Ranking (Feature 2)
 */
function rankDonorsWithML($recipientBlood, $donors, $urgency = 'Normal') {
    if (empty($donors)) {
        return [];
    }

    // Tier 1: Try Flask API
    $payload = [
        'recipient_blood' => $recipientBlood,
        'urgency'         => $urgency,
        'donors'          => $donors
    ];
    $apiResult = callFlaskApi('/api/rank', $payload, 'POST', 1.2);
    if ($apiResult && !empty($apiResult['success']) && !empty($apiResult['results'])) {
        return $apiResult['results'];
    }

    // Tier 2: Try Python CLI
    $py = getPythonExecutable();
    $script = dirname(__DIR__) . '/ml/ranker.py';
    if (file_exists($script)) {
        $jsonInput = json_encode($payload);
        $escaped = escapeshellarg($jsonInput);
        $cmd = "\"{$py}\" \"{$script}\" {$escaped}";
        $output = @shell_exec($cmd);
        if ($output) {
            $json = json_decode($output, true);
            if (is_array($json) && !empty($json)) {
                return $json;
            }
        }
    }

    // Tier 3: Native PHP Rule-Based Ranking Fallback
    return nativePhpDonorRanker($recipientBlood, $donors, $urgency);
}

/**
 * HTTP Helper to talk to Flask API
 */
function callFlaskApi($endpoint, $data = [], $method = 'POST', $timeout = 1.0) {
    if (!extension_loaded('curl')) {
        return null;
    }

    $url = FLASK_API_BASE_URL . $endpoint;
    $ch = curl_init();

    $options = [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT_MS => (int)($timeout * 500),
        CURLOPT_TIMEOUT_MS        => (int)($timeout * 1000),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    ];

    if ($method === 'POST') {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
    }

    curl_setopt_array($ch, $options);
    $response = curl_exec($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err || $status !== 200 || !$response) {
        return null;
    }

    return json_decode($response, true);
}

/**
 * Native PHP Fallback NLP Parser
 */
function nativePhpNlpParser($text) {
    $bloodPatterns = [
        '/\b(ab[\s\-]*(?:positive|\+ve))\b/i' => 'AB+',
        '/\b(ab[\s\-]*(?:negative|\-ve))\b/i' => 'AB-',
        '/\b(a[\s\-]*(?:positive|\+ve))\b/i'  => 'A+',
        '/\b(a[\s\-]*(?:negative|\-ve))\b/i'  => 'A-',
        '/\b(b[\s\-]*(?:positive|\+ve))\b/i'  => 'B+',
        '/\b(b[\s\-]*(?:negative|\-ve))\b/i'  => 'B-',
        '/\b(o[\s\-]*(?:positive|\+ve))\b/i'  => 'O+',
        '/\b(o[\s\-]*(?:negative|\-ve))\b/i'  => 'O-',
        '/\bab[\s]*\+/i'                       => 'AB+',
        '/\bab[\s]*\-/i'                       => 'AB-',
        '/\ba[\s]*\+/i'                        => 'A+',
        '/\ba[\s]*\-/i'                        => 'A-',
        '/\bb[\s]*\+/i'                        => 'B+',
        '/\bb[\s]*\-/i'                        => 'B-',
        '/\bo[\s]*\+/i'                        => 'O+',
        '/\bo[\s]*\-/i'                        => 'O-'
    ];

    $extractedBlood = null;
    foreach ($bloodPatterns as $pattern => $grp) {
        if (preg_match($pattern, $text)) {
            $extractedBlood = $grp;
            break;
        }
    }

    // Urgency
    $urgency = 'Normal';
    if (preg_match('/\b(emergency|critical|immediately|asap|icu|severe)\b/i', $text)) {
        $urgency = 'Emergency';
    } elseif (preg_match('/\b(urgent|urgently|quick|today|fast)\b/i', $text)) {
        $urgency = 'Urgent';
    }

    // Availability
    $availPref = (bool) preg_match('/\b(available|ready|online|active)\b/i', $text);

    // Location extraction
    require_once __DIR__ . '/distance.php';
    $resolvedLoc = resolveLocationCoordinates($text);
    $area = $resolvedLoc ? $resolvedLoc['name'] : null;
    $district = $resolvedLoc ? $resolvedLoc['district'] : null;
    $rawLoc = $resolvedLoc ? ($area . ($area !== $district ? ", " . $district : "")) : "";

    return [
        'blood_group'             => $extractedBlood,
        'district'                => $district,
        'city_area'               => $area,
        'division'                => $resolvedLoc['division'] ?? null,
        'urgency'                 => $urgency,
        'availability_preference' => $availPref,
        'raw_location'            => $rawLoc
    ];
}

/**
 * Native PHP Fallback Donor Ranker (Deterministic Mirror of ML Logic)
 */
function nativePhpDonorRanker($recipientBlood, $donors, $urgency = 'Normal') {
    require_once __DIR__ . '/compatibility.php';
    $results = [];

    foreach ($donors as $d) {
        $donorBlood = $d['blood_group'] ?? '';
        $isCompat = isBloodCompatible($recipientBlood, $donorBlood);
        $compatScore = getCompatibilityScore($recipientBlood, $donorBlood);
        $compatReason = getCompatibilityExplanation($recipientBlood, $donorBlood);

        if (!$isCompat) {
            $d['recommendation_score'] = 0;
            $d['is_compatible'] = false;
            $d['reasons'] = [$compatReason, "Medical safety restraint: ABO/Rh incompatibility"];
            $d['badge'] = "Incompatible";
            $d['score_label'] = "0%";
            $results[] = $d;
            continue;
        }

        $isAvail = !empty($d['available']);
        $distance = isset($d['distance_km']) && $d['distance_km'] !== '' ? (float)$d['distance_km'] : null;
        $elig = checkDonationEligibility($d['last_donated'] ?? null);
        $prevDonations = (int)($d['total_donations'] ?? 0);
        $respRate = (float)($d['response_rate'] ?? 85.0);

        // Scoring Formula
        $score = $compatScore * 35.0;
        $score += $isAvail ? 30.0 : 5.0;

        if ($distance !== null) {
            $distScore = max(0.0, 20.0 - ($distance * 0.8));
            $score += $distScore;
        } else {
            $score += 10.0;
        }

        $score += $elig['eligible'] ? 10.0 : 2.0;
        $score += min(5.0, $prevDonations * 1.0);
        $score += ($respRate / 100.0) * 5.0;

        $finalScore = (int) min(98, max(15, round($score)));

        // Reasons
        $reasons = [$compatReason];
        $reasons[] = $isAvail ? "Currently available for donation" : "Marked unavailable on profile";

        if ($distance !== null) {
            if ($distance <= 3.0) {
                $reasons[] = "Nearby location ({$distance} km)";
            } elseif ($distance <= 10.0) {
                $reasons[] = "Accessible proximity ({$distance} km)";
            } else {
                $reasons[] = "Location distance: {$distance} km";
            }
        } else {
            $reasons[] = "Location match: " . ($d['location'] ?? '') . ", " . ($d['district'] ?? '');
        }

        if ($elig['eligible']) {
            $reasons[] = "Eligible cooldown: {$elig['days_elapsed']} days since last donation";
        } else {
            $reasons[] = "Recent donation ({$elig['days_elapsed']} days ago; 90-day cooldown)";
        }

        if ($prevDonations >= 3) {
            $reasons[] = "Experienced voluntary donor ({$prevDonations} donations)";
        }

        $badge = "Recommended";
        if ($finalScore >= 90) {
            $badge = "Highly Recommended";
        } elseif ($finalScore >= 80) {
            $badge = "Recommended";
        } elseif (!$isAvail) {
            $badge = "Unavailable";
        } else {
            $badge = "Potential Match";
        }

        $d['recommendation_score'] = $finalScore;
        $d['is_compatible'] = true;
        $d['reasons'] = $reasons;
        $d['badge'] = $badge;
        $d['score_label'] = "{$finalScore}%";
        $results[] = $d;
    }

    usort($results, function ($a, $b) {
        return $b['recommendation_score'] <=> $a['recommendation_score'];
    });

    return $results;
}
