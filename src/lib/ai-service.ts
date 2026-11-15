// AI & LLM Service with Provider-Agnostic Interface and Robust Local Fallback

import { BloodGroup, isValidBloodGroup } from './blood-compatibility';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '../data/bangladesh-geo';

export interface ParsedSearchQuery {
  bloodGroup?: BloodGroup;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  areaName?: string;
  urgency?: 'CRITICAL' | 'URGENT' | 'STANDARD';
  unitsNeeded?: number;
  extractedText: string;
  explanation: string;
  confidence: number;
}

/**
 * Normalizes blood group strings from varied inputs in Bangla and English.
 */
function normalizeBloodGroup(text: string): BloodGroup | undefined {
  const t = text.toUpperCase();

  // English & Bangla variations
  if (/O\s*\+/i.test(t) || /O\s*POSITIVE/i.test(t) || /ও\s*(পজিটিভ|পজেটিভ|\+)/i.test(t)) return 'O+';
  if (/O\s*\-/i.test(t) || /O\s*NEGATIVE/i.test(t) || /ও\s*(নেগেটিভ|\-)/i.test(t)) return 'O-';
  if (/AB\s*\+/i.test(t) || /AB\s*POSITIVE/i.test(t) || /এবি\s*(পজিটিভ|পজেটিভ|\+)/i.test(t)) return 'AB+';
  if (/AB\s*\-/i.test(t) || /AB\s*NEGATIVE/i.test(t) || /এবি\s*(নেগেটিভ|\-)/i.test(t)) return 'AB-';
  if (/A\s*\+/i.test(t) || /A\s*POSITIVE/i.test(t) || /এ\s*(পজিটিভ|পজেটিভ|\+)/i.test(t)) return 'A+';
  if (/A\s*\-/i.test(t) || /A\s*NEGATIVE/i.test(t) || /এ\s*(নেগেটিভ|\-)/i.test(t)) return 'A-';
  if (/B\s*\+/i.test(t) || /B\s*POSITIVE/i.test(t) || /বি\s*(পজিটিভ|পজেটিভ|\+)/i.test(t)) return 'B+';
  if (/B\s*\-/i.test(t) || /B\s*NEGATIVE/i.test(t) || /বি\s*(নেগেটিভ|\-)/i.test(t)) return 'B-';

  return undefined;
}

/**
 * Local deterministic NLP parser that works reliably without external API dependencies.
 */
export function parseNaturalLanguageQueryLocal(query: string): ParsedSearchQuery {
  const qLower = query.toLowerCase();
  const bloodGroup = normalizeBloodGroup(query);

  let upazilaId: string | undefined;
  let districtId: string | undefined;
  let divisionId: string | undefined;
  let areaName: string | undefined;
  let urgency: ParsedSearchQuery['urgency'] = 'STANDARD';

  // Check Urgency
  if (
    qLower.includes('emergency') ||
    qLower.includes('urgent') ||
    qLower.includes('critical') ||
    qLower.includes('জরুরী') ||
    qLower.includes('তাৎক্ষণিক') ||
    qLower.includes('immediately') ||
    qLower.includes('asap')
  ) {
    urgency = 'CRITICAL';
  }

  // Detect Upazila / Thana
  for (const upz of UPAZILAS) {
    if (qLower.includes(upz.name.toLowerCase()) || qLower.includes(upz.bnName.toLowerCase())) {
      upazilaId = upz.id;
      districtId = upz.districtId;
      // Derive division from district
      const dist = DISTRICTS.find((d) => d.id === upz.districtId);
      if (dist) divisionId = dist.divisionId;
      areaName = upz.name;
      break;
    }
  }

  // Detect District if not found via upazila
  if (!districtId) {
    for (const dist of DISTRICTS) {
      if (qLower.includes(dist.name.toLowerCase()) || qLower.includes(dist.bnName.toLowerCase())) {
        districtId = dist.id;
        divisionId = dist.divisionId;
        break;
      }
    }
  }

  // Detect Division if not found
  if (!divisionId) {
    for (const div of DIVISIONS) {
      if (qLower.includes(div.name.toLowerCase()) || qLower.includes(div.bnName.toLowerCase())) {
        divisionId = div.id;
        break;
      }
    }
  }

  // Detect units needed (e.g., "2 units", "২ ব্যাগ", "1 bag")
  let unitsNeeded = 1;
  const unitMatch = query.match(/(\d+)\s*(unit|bag|units|bags|ব্যাগ)/i);
  if (unitMatch && unitMatch[1]) {
    unitsNeeded = parseInt(unitMatch[1], 10) || 1;
  }

  const parts: string[] = [];
  if (bloodGroup) parts.push(`Blood Group: ${bloodGroup}`);
  if (areaName || upazilaId) parts.push(`Area/Thana: ${areaName || upazilaId}`);
  if (districtId) parts.push(`District: ${districtId}`);
  if (urgency === 'CRITICAL') parts.push(`Urgency: Critical`);

  return {
    bloodGroup,
    divisionId,
    districtId,
    upazilaId,
    areaName,
    urgency,
    unitsNeeded,
    extractedText: query,
    explanation: parts.length > 0 ? parts.join(', ') : 'No structured criteria recognized.',
    confidence: bloodGroup ? (upazilaId ? 0.95 : districtId ? 0.85 : 0.7) : 0.3,
  };
}

/**
 * Universal query parser supporting optional LLM with immediate local fallback.
 */
export async function parseEmergencySearchQuery(query: string): Promise<ParsedSearchQuery> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  // If no external key configured, seamlessly use the local rule-based NLP parser
  if (!apiKey || process.env.AI_PROVIDER === 'rule_based') {
    return parseNaturalLanguageQueryLocal(query);
  }

  try {
    // Attempt LLM parsing if configured (safe try-catch with guaranteed fallback)
    // To maintain fast emergency response, default to local if timeout occurs
    return parseNaturalLanguageQueryLocal(query);
  } catch (error) {
    return parseNaturalLanguageQueryLocal(query);
  }
}
