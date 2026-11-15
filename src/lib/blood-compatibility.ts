// Red Blood Cell (RBC) Donor-Recipient Compatibility Matrix
// In emergency transfusions, recipient safety depends on matching compatible ABO and Rh antigens.

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

/**
 * Maps each recipient blood group to the list of donor blood groups they can safely receive red blood cells from.
 */
export const RBC_RECIPIENT_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  // O- can only receive from O-
  'O-': ['O-'],
  // O+ can receive from O+ and O-
  'O+': ['O+', 'O-'],
  // A- can receive from A- and O-
  'A-': ['A-', 'O-'],
  // A+ can receive from A+, A-, O+, O-
  'A+': ['A+', 'A-', 'O+', 'O-'],
  // B- can receive from B- and O-
  'B-': ['B-', 'O-'],
  // B+ can receive from B+, B-, O+, O-
  'B+': ['B+', 'B-', 'O+', 'O-'],
  // AB- can receive from AB-, A-, B-, O-
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  // AB+ is universal recipient for red blood cells
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

/**
 * Maps each donor blood group to who can receive their red blood cells.
 */
export const RBC_DONOR_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal RBC donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

/**
 * Validates if a string is a valid ABO/Rh blood group
 */
export function isValidBloodGroup(group: string): group is BloodGroup {
  return (BLOOD_GROUPS as readonly string[]).includes(group);
}

/**
 * Determines whether a donor can donate red blood cells to a recipient.
 */
export function isRbcCompatible(donorGroup: string, recipientGroup: string): boolean {
  if (!isValidBloodGroup(donorGroup) || !isValidBloodGroup(recipientGroup)) {
    return false;
  }
  return RBC_RECIPIENT_COMPATIBILITY_MAP[recipientGroup].includes(donorGroup);
}

/**
 * Returns all compatible donor blood groups for a given patient blood group.
 */
export function getCompatibleDonorBloodGroups(patientBloodGroup: string): BloodGroup[] {
  if (!isValidBloodGroup(patientBloodGroup)) {
    return [];
  }
  return RBC_RECIPIENT_COMPATIBILITY_MAP[patientBloodGroup];
}
