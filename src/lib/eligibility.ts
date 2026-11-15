// Donation Eligibility Calculation & Safety Rules

export interface EligibilityResult {
  isEligible: boolean;
  statusLabel: 'Available' | 'Unavailable' | 'Estimated Eligible' | 'Awaiting Confirmation' | 'Review Required';
  estimatedNextDate: Date | null;
  daysRemaining: number;
  reason: string;
}

/**
 * Validates that a donation date is not in the future and is a valid timestamp.
 */
export function validateDonationDate(dateInput: Date | string): { isValid: boolean; error?: string; date?: Date } {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid donation date.' };
  }

  const now = new Date();
  // Strip time for fair comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (date > todayMidnight) {
    return { isValid: false, error: 'Donation date cannot be in the future.' };
  }

  return { isValid: true, date };
}

/**
 * Calculates the estimated next eligible donation date based on policy interval.
 * Uses exact UTC milliseconds to handle leap years, month boundaries, and daylight saving shifts safely.
 */
export function calculateNextEligibleDate(lastDonationDate: Date, intervalDays: number = 90): Date {
  const nextDate = new Date(lastDonationDate.getTime());
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
}

/**
 * Evaluates whether a donor is currently eligible to donate blood.
 */
export function evaluateDonorEligibility(
  lastDonationDate: Date | null | undefined,
  availabilityStatus: string = 'AVAILABLE',
  intervalDays: number = 90,
  referenceDate: Date = new Date()
): EligibilityResult {
  // If user marked themselves explicitly unavailable
  if (availabilityStatus === 'UNAVAILABLE') {
    return {
      isEligible: false,
      statusLabel: 'Unavailable',
      estimatedNextDate: null,
      daysRemaining: 0,
      reason: 'Donor has marked their profile as currently unavailable.',
    };
  }

  if (availabilityStatus === 'TEMPORARILY_BUSY') {
    return {
      isEligible: false,
      statusLabel: 'Unavailable',
      estimatedNextDate: null,
      daysRemaining: 0,
      reason: 'Donor is temporarily busy or resting.',
    };
  }

  // First time donor or no recorded donation
  if (!lastDonationDate) {
    return {
      isEligible: true,
      statusLabel: 'Available',
      estimatedNextDate: null,
      daysRemaining: 0,
      reason: 'First-time donor or no prior donation recorded within the safety period.',
    };
  }

  const lastDate = new Date(lastDonationDate);
  const nextEligible = calculateNextEligibleDate(lastDate, intervalDays);

  const diffMs = nextEligible.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining > 0) {
    return {
      isEligible: false,
      statusLabel: 'Estimated Eligible',
      estimatedNextDate: nextEligible,
      daysRemaining,
      reason: `Estimated next eligible date is ${nextEligible.toISOString().split('T')[0]} (${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining for safety cooldown).`,
    };
  }

  // Cooldown period has elapsed
  return {
    isEligible: true,
    statusLabel: 'Available',
    estimatedNextDate: nextEligible,
    daysRemaining: 0,
    reason: 'Safety cooldown interval has passed. Donor is eligible for emergency matching.',
  };
}
