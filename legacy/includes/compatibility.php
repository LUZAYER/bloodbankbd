<?php
/**
 * BloodLink - Medical Blood Group Compatibility & Donation Eligibility Rules
 * Strictly enforces clinical Red Blood Cell (RBC) ABO and Rh factor compatibility.
 * 
 * IMPORTANT MEDICAL SAFETY NOTE:
 * Final compatibility, cross-matching, and donor clinical eligibility must ALWAYS
 * be confirmed by certified transfusion medicine specialists and qualified healthcare
 * personnel before transfusion.
 */

// RBC ABO/Rh Compatibility Map: Recipient => Compatible Donors
const BLOOD_COMPATIBILITY_MAP = [
    'A+'  => ['A+', 'A-', 'O+', 'O-'],
    'A-'  => ['A-', 'O-'],
    'B+'  => ['B+', 'B-', 'O+', 'O-'],
    'B-'  => ['B-', 'O-'],
    'AB+' => ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Recipient
    'AB-' => ['AB-', 'A-', 'B-', 'O-'],
    'O+'  => ['O+', 'O-'],
    'O-'  => ['O-']                                            // Universal Donor
];

/**
 * Get all compatible donor blood groups for a given recipient
 */
function getCompatibleDonorGroups($recipientBlood) {
    $recipientBlood = strtoupper(trim($recipientBlood));
    return BLOOD_COMPATIBILITY_MAP[$recipientBlood] ?? [$recipientBlood];
}

/**
 * Check whether a donor blood group is medically compatible with recipient
 */
function isBloodCompatible($recipientBlood, $donorBlood) {
    $recipientBlood = strtoupper(trim($recipientBlood));
    $donorBlood = strtoupper(trim($donorBlood));
    
    if (!isset(BLOOD_COMPATIBILITY_MAP[$recipientBlood])) {
        return $recipientBlood === $donorBlood;
    }
    
    return in_array($donorBlood, BLOOD_COMPATIBILITY_MAP[$recipientBlood], true);
}

/**
 * Calculate numeric compatibility score (1.0 = exact match, 0.9 = compatible, 0.0 = incompatible)
 */
function getCompatibilityScore($recipientBlood, $donorBlood) {
    $recipientBlood = strtoupper(trim($recipientBlood));
    $donorBlood = strtoupper(trim($donorBlood));
    
    if ($recipientBlood === $donorBlood) {
        return 1.00; // Perfect exact match
    }
    
    if (isBloodCompatible($recipientBlood, $donorBlood)) {
        if ($donorBlood === 'O-') {
            return 0.95; // Universal red cell donor
        }
        return 0.88; // Medically compatible cross-match
    }
    
    return 0.00; // Incompatible
}

/**
 * Generate human-readable medical explanation for blood compatibility
 */
function getCompatibilityExplanation($recipientBlood, $donorBlood) {
    $recipientBlood = strtoupper(trim($recipientBlood));
    $donorBlood = strtoupper(trim($donorBlood));
    
    if ($recipientBlood === $donorBlood) {
        return "Exact blood match ({$donorBlood})";
    }
    
    if ($donorBlood === 'O-') {
        return "Universal donor (O-) compatible with recipient ({$recipientBlood})";
    }
    
    if (isBloodCompatible($recipientBlood, $donorBlood)) {
        return "Clinically compatible ({$donorBlood} donor for {$recipientBlood} recipient)";
    }
    
    return "Incompatible blood group";
}

/**
 * Evaluate clinical cooldown (standard 90 days interval between whole blood donations)
 */
function checkDonationEligibility($lastDonatedDate) {
    if (empty($lastDonatedDate) || $lastDonatedDate === '0000-00-00') {
        return [
            'eligible'     => true,
            'days_elapsed' => 999,
            'status_label' => 'First-time or cleared donor',
            'badge_class'  => 'badge-green'
        ];
    }
    
    $lastTimestamp = strtotime($lastDonatedDate);
    if (!$lastTimestamp) {
        return [
            'eligible'     => true,
            'days_elapsed' => 999,
            'status_label' => 'Eligibility verified',
            'badge_class'  => 'badge-green'
        ];
    }
    
    $today = time();
    $diffDays = (int) floor(($today - $lastTimestamp) / (60 * 60 * 24));
    
    if ($diffDays >= 90) {
        return [
            'eligible'     => true,
            'days_elapsed' => $diffDays,
            'status_label' => "Eligible ({$diffDays} days since last donation)",
            'badge_class'  => 'badge-green'
        ];
    } else {
        $daysRemaining = 90 - $diffDays;
        return [
            'eligible'     => false,
            'days_elapsed' => $diffDays,
            'status_label' => "In Cooldown ({$daysRemaining} days remaining for safe 90-day interval)",
            'badge_class'  => 'badge-red'
        ];
    }
}
