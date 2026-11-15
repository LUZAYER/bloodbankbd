// AI/ML & Deterministic Two-Stage Matching Engine for BloodBond Bangladesh

import { isRbcCompatible, getCompatibleDonorBloodGroups } from './blood-compatibility';
import { evaluateDonorEligibility } from './eligibility';
import { calculateHaversineDistance } from '../data/bangladesh-geo';
export { calculateHaversineDistance };

export interface MatchingCriteria {
  patientBloodGroup: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  searchRadiusKm?: number;
  requiredDate?: Date;
  emergencyPriority?: 'CRITICAL' | 'URGENT' | 'STANDARD';
  safetyIntervalDays?: number;
}

export interface DonorCandidate {
  id: string; // donorProfileId
  userId: string;
  fullName: string;
  bloodGroup: string;
  divisionId: string;
  divisionName?: string;
  districtId: string;
  districtName?: string;
  upazilaId: string;
  upazilaName?: string;
  areaName: string;
  addressDetails?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  availabilityStatus: string;
  verificationStatus: string;
  lastDonationDate?: Date | null;
  nextEligibleDate?: Date | null;
  responseRate: number;
  totalDonationsCount: number;
  phone?: string;
  email?: string | null;
}

export interface RankedMatch {
  donor: DonorCandidate;
  tier: 'EXACT_AREA' | 'SAME_THANA' | 'SAME_DISTRICT' | 'SAME_DIVISION' | 'OTHER';
  matchTierLabel: string;
  rankingScore: number;
  deterministicScore: number;
  distanceKm?: number;
  isExactArea: boolean;
  isSameThana: boolean;
  isSameDistrict: boolean;
  isVerified: boolean;
  compatibilityExplanation: string;
  proximityExplanation: string;
  overallExplanation: string;
}

export interface MatchingResponse {
  totalFound: number;
  tierCounts: {
    exactArea: number;
    sameThana: number;
    sameDistrict: number;
    expanded: number;
  };
  criteriaSummary: {
    patientBloodGroup: string;
    compatibleDonorGroups: string[];
    locationLabel: string;
  };
  matches: RankedMatch[];
  fallbackSuggested: boolean;
}

/**
 * Stage 1: Deterministic Eligibility & Compatibility Filter
 */
export function filterEligibleCandidates(
  donors: DonorCandidate[],
  criteria: MatchingCriteria
): DonorCandidate[] {
  const compatibleGroups = getCompatibleDonorBloodGroups(criteria.patientBloodGroup);
  const intervalDays = criteria.safetyIntervalDays || 90;

  return donors.filter((donor) => {
    // 1. Hard blood compatibility check
    if (!compatibleGroups.includes(donor.bloodGroup as any)) {
      return false;
    }

    // 2. Availability status check
    if (donor.availabilityStatus !== 'AVAILABLE') {
      return false;
    }

    // 3. Donation cooldown eligibility check
    const eligibility = evaluateDonorEligibility(
      donor.lastDonationDate,
      donor.availabilityStatus,
      intervalDays,
      criteria.requiredDate || new Date()
    );

    if (!eligibility.isEligible) {
      return false;
    }

    return true;
  });
}

/**
 * Stage 2: Match Ranking & Proximity Scoring
 */
export function rankDonorMatches(
  eligibleDonors: DonorCandidate[],
  criteria: MatchingCriteria
): MatchingResponse {
  const compatibleGroups = getCompatibleDonorBloodGroups(criteria.patientBloodGroup);
  const searchAreaLower = criteria.areaName ? criteria.areaName.toLowerCase().trim() : '';

  let exactAreaCount = 0;
  let sameThanaCount = 0;
  let sameDistrictCount = 0;
  let expandedCount = 0;

  const ranked: RankedMatch[] = eligibleDonors.map((donor) => {
    let score = 0;
    const explanations: string[] = [];

    // Blood compatibility note
    if (donor.bloodGroup === criteria.patientBloodGroup) {
      score += 30;
      explanations.push(`Exact blood group match (${donor.bloodGroup}).`);
    } else {
      score += 25;
      explanations.push(
        `Compatible red blood cell donor group (${donor.bloodGroup} is clinically compatible with ${criteria.patientBloodGroup} recipient).`
      );
    }

    // Geographic Tier Evaluation
    const donorAreaLower = (donor.areaName || '').toLowerCase().trim();
    const isExactArea = Boolean(searchAreaLower && donorAreaLower.includes(searchAreaLower));
    const isSameThana = Boolean(criteria.upazilaId && donor.upazilaId === criteria.upazilaId);
    const isSameDistrict = Boolean(criteria.districtId && donor.districtId === criteria.districtId);
    const isSameDivision = Boolean(criteria.divisionId && donor.divisionId === criteria.divisionId);

    let tier: RankedMatch['tier'] = 'OTHER';
    let tierLabel = 'District Expansion';

    if (isExactArea) {
      score += 40;
      tier = 'EXACT_AREA';
      tierLabel = 'Exact Area Match';
      exactAreaCount++;
      explanations.push(`Located directly in ${donor.areaName}.`);
    } else if (isSameThana) {
      score += 30;
      tier = 'SAME_THANA';
      tierLabel = 'Same Thana/Upazila';
      sameThanaCount++;
      explanations.push(`Located within the same thana/upazila (${donor.upazilaName || donor.upazilaId}).`);
    } else if (isSameDistrict) {
      score += 15;
      tier = 'SAME_DISTRICT';
      tierLabel = 'Same District';
      sameDistrictCount++;
      explanations.push(`Located within ${donor.districtName || donor.districtId} district.`);
    } else if (isSameDivision) {
      score += 5;
      tier = 'SAME_DIVISION';
      tierLabel = 'Division Expansion';
      expandedCount++;
      explanations.push(`Located within ${donor.divisionName || donor.divisionId} division.`);
    } else {
      tier = 'OTHER';
      tierLabel = 'National Network';
      expandedCount++;
    }

    // Distance calculation if coordinates available
    let distanceKm: number | undefined;
    let proximityExplanation = 'Exact GPS distance unavailable';
    if (
      criteria.latitude &&
      criteria.longitude &&
      donor.latitude &&
      donor.longitude
    ) {
      distanceKm = calculateHaversineDistance(
        criteria.latitude,
        criteria.longitude,
        donor.latitude,
        donor.longitude
      );
      // Proximity score (Max 20 pts for <= 3km, decays with distance)
      if (distanceKm <= 3) {
        score += 20;
      } else if (distanceKm <= 7) {
        score += 15;
      } else if (distanceKm <= 15) {
        score += 10;
      } else if (distanceKm <= 30) {
        score += 5;
      }
      proximityExplanation = `Approximately ${distanceKm} km away`;
      explanations.push(proximityExplanation);
    }

    // Profile verification bonus
    const isVerified = donor.verificationStatus === 'VERIFIED';
    if (isVerified) {
      score += 10;
      explanations.push('Verified donor profile.');
    }

    // Historical response rate (up to 10 points)
    const responseBonus = Math.round((donor.responseRate || 1.0) * 10);
    score += responseBonus;

    // Experience bonus (total donations recorded)
    if (donor.totalDonationsCount > 3) {
      score += 5;
    }

    const overallExplanation = explanations.join(' • ');

    return {
      donor,
      tier,
      matchTierLabel: tierLabel,
      rankingScore: score,
      deterministicScore: isExactArea ? 100 : isSameThana ? 80 : isSameDistrict ? 60 : 40,
      distanceKm,
      isExactArea,
      isSameThana,
      isSameDistrict,
      isVerified,
      compatibilityExplanation: donor.bloodGroup === criteria.patientBloodGroup
        ? `Identical blood group (${donor.bloodGroup})`
        : `Compatible donor group (${donor.bloodGroup}) for ${criteria.patientBloodGroup}`,
      proximityExplanation,
      overallExplanation,
    };
  });

  // Sort by rankingScore descending, exact area priority first
  ranked.sort((a, b) => {
    if (a.tier === 'EXACT_AREA' && b.tier !== 'EXACT_AREA') return -1;
    if (b.tier === 'EXACT_AREA' && a.tier !== 'EXACT_AREA') return 1;
    if (a.tier === 'SAME_THANA' && b.tier !== 'SAME_THANA' && b.tier !== 'EXACT_AREA') return -1;
    if (b.tier === 'SAME_THANA' && a.tier !== 'SAME_THANA' && a.tier !== 'EXACT_AREA') return 1;
    return b.rankingScore - a.rankingScore;
  });

  return {
    totalFound: ranked.length,
    tierCounts: {
      exactArea: exactAreaCount,
      sameThana: sameThanaCount,
      sameDistrict: sameDistrictCount,
      expanded: expandedCount,
    },
    criteriaSummary: {
      patientBloodGroup: criteria.patientBloodGroup,
      compatibleDonorGroups: compatibleGroups,
      locationLabel: [criteria.areaName, criteria.upazilaId, criteria.districtId]
        .filter(Boolean)
        .join(', '),
    },
    matches: ranked,
    fallbackSuggested: exactAreaCount === 0 && ranked.length > 0,
  };
}
