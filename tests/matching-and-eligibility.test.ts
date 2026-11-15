import { describe, it, expect } from 'vitest';
import {
  isRbcCompatible,
  getCompatibleDonorBloodGroups,
  isValidBloodGroup,
} from '../src/lib/blood-compatibility';
import {
  validateDonationDate,
  calculateNextEligibleDate,
  evaluateDonorEligibility,
} from '../src/lib/eligibility';
import { calculateHaversineDistance } from '../src/data/bangladesh-geo';
import {
  filterEligibleCandidates,
  rankDonorMatches,
  DonorCandidate,
  MatchingCriteria,
} from '../src/lib/matching-engine';
import { parseNaturalLanguageQueryLocal } from '../src/lib/ai-service';

describe('Blood Compatibility Matrix', () => {
  it('correctly validates blood group tokens', () => {
    expect(isValidBloodGroup('O+')).toBe(true);
    expect(isValidBloodGroup('O-')).toBe(true);
    expect(isValidBloodGroup('AB+')).toBe(true);
    expect(isValidBloodGroup('C+')).toBe(false);
  });

  it('O- is universal red blood cell donor', () => {
    const allGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    allGroups.forEach((recipient) => {
      expect(isRbcCompatible('O-', recipient)).toBe(true);
    });
  });

  it('O+ can safely donate red blood cells to O+, A+, B+, AB+', () => {
    expect(isRbcCompatible('O+', 'O+')).toBe(true);
    expect(isRbcCompatible('O+', 'A+')).toBe(true);
    expect(isRbcCompatible('O+', 'B+')).toBe(true);
    expect(isRbcCompatible('O+', 'AB+')).toBe(true);
    // Cannot donate to negative groups
    expect(isRbcCompatible('O+', 'O-')).toBe(false);
    expect(isRbcCompatible('O+', 'A-')).toBe(false);
  });

  it('AB+ is universal RBC recipient', () => {
    const allGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    allGroups.forEach((donor) => {
      expect(isRbcCompatible(donor, 'AB+')).toBe(true);
    });
  });

  it('returns compatible donor blood groups for O+ recipient', () => {
    const donors = getCompatibleDonorBloodGroups('O+');
    expect(donors).toEqual(['O+', 'O-']);
  });
});

describe('Donation Date & Eligibility Calculation', () => {
  it('prevents future donation dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const check = validateDonationDate(futureDate);
    expect(check.isValid).toBe(false);
    expect(check.error).toContain('cannot be in the future');
  });

  it('correctly calculates next eligible date with 90-day cooldown', () => {
    const donationDate = new Date('2026-01-01T00:00:00Z');
    const nextDate = calculateNextEligibleDate(donationDate, 90);

    const diffDays = Math.round(
      (nextDate.getTime() - donationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBe(90);
  });

  it('marks donor ineligible if within cooldown period', () => {
    const now = new Date();
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

    const result = evaluateDonorEligibility(twentyDaysAgo, 'AVAILABLE', 90, now);
    expect(result.isEligible).toBe(false);
    expect(result.statusLabel).toBe('Estimated Eligible');
    expect(result.daysRemaining).toBe(70);
  });

  it('marks donor eligible once cooldown has passed', () => {
    const now = new Date();
    const hundredDaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);

    const result = evaluateDonorEligibility(hundredDaysAgo, 'AVAILABLE', 90, now);
    expect(result.isEligible).toBe(true);
    expect(result.statusLabel).toBe('Available');
  });
});

describe('Geographic Proximity & Haversine Distance', () => {
  it('calculates realistic distance between Wari and Dhanmondi in Dhaka', () => {
    // Wari coordinates: ~23.7196, 90.4184
    // Dhanmondi coordinates: ~23.7461, 90.3742
    const distanceKm = calculateHaversineDistance(23.7196, 90.4184, 23.7461, 90.3742);
    expect(distanceKm).toBeGreaterThan(4);
    expect(distanceKm).toBeLessThan(7);
  });
});

describe('Two-Stage Matching Engine', () => {
  const mockDonors: DonorCandidate[] = [
    {
      id: 'd1',
      userId: 'u1',
      fullName: 'Tanvir (Wari O+ Eligible)',
      bloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Rankin Street, Wari',
      latitude: 23.7196,
      longitude: 90.4184,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: new Date('2025-01-01'),
      responseRate: 0.95,
      totalDonationsCount: 4,
    },
    {
      id: 'd2',
      userId: 'u2',
      fullName: 'Kamal (Wari O+ In Cooldown)',
      bloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Narinda, Wari',
      latitude: 23.712,
      longitude: 90.419,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: new Date(), // Just donated today
      responseRate: 0.9,
      totalDonationsCount: 1,
    },
    {
      id: 'd3',
      userId: 'u3',
      fullName: 'Sabbir (Dhanmondi O+ Nearby)',
      bloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'dhanmondi',
      areaName: 'Dhanmondi 27',
      latitude: 23.753,
      longitude: 90.373,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: new Date('2025-01-01'),
      responseRate: 0.9,
      totalDonationsCount: 3,
    },
  ];

  it('Stage 1 filters out donors currently in cooldown', () => {
    const criteria: MatchingCriteria = {
      patientBloodGroup: 'O+',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Wari',
      safetyIntervalDays: 90,
    };

    const eligible = filterEligibleCandidates(mockDonors, criteria);
    // d2 is in cooldown, so only d1 and d3 should be eligible
    expect(eligible.some((d) => d.id === 'd2')).toBe(false);
    expect(eligible.some((d) => d.id === 'd1')).toBe(true);
  });

  it('Stage 2 ranks Wari exact area match first before Dhanmondi', () => {
    const criteria: MatchingCriteria = {
      patientBloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Wari',
      latitude: 23.7196,
      longitude: 90.4184,
      safetyIntervalDays: 90,
    };

    const eligible = filterEligibleCandidates(mockDonors, criteria);
    const results = rankDonorMatches(eligible, criteria);

    expect(results.matches.length).toBeGreaterThan(0);
    // First match must be the Wari donor!
    expect(results.matches[0].donor.id).toBe('d1');
    expect(results.matches[0].tier).toBe('EXACT_AREA');
    expect(results.matches[0].rankingScore).toBeGreaterThan(results.matches[1].rankingScore);
  });
});

describe('Natural Language AI Query Parser', () => {
  it('parses English emergency query for O+ in Wari', () => {
    const parsed = parseNaturalLanguageQueryLocal('I need O positive blood near Wari Hospital urgently today');
    expect(parsed.bloodGroup).toBe('O+');
    expect(parsed.upazilaId).toBe('wari');
    expect(parsed.districtId).toBe('dhaka');
    expect(parsed.urgency).toBe('CRITICAL');
  });

  it('parses Bangla query for O+ in Wari', () => {
    const parsed = parseNaturalLanguageQueryLocal('জরুরী ও পজিটিভ রক্ত লাগবে ওয়ারী এলাকায়');
    expect(parsed.bloodGroup).toBe('O+');
    expect(parsed.upazilaId).toBe('wari');
    expect(parsed.urgency).toBe('CRITICAL');
  });
});
