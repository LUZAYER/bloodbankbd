#!/usr/bin/env python3
"""
BloodLink - Natural Language Query Parser (Feature 1)
Extracts structured search parameters from natural language inputs using rule-based NLP,
regex patterns, entity gazetteers, and semantic token extraction.
"""

import re
import sys
import json

# Entity dictionaries for Bangladesh geography
BANGLADESH_LOCATIONS = {
    "wari": {"name": "Wari", "district": "Dhaka", "division": "Dhaka"},
    "motijheel": {"name": "Motijheel", "district": "Dhaka", "division": "Dhaka"},
    "dhanmondi": {"name": "Dhanmondi", "district": "Dhaka", "division": "Dhaka"},
    "mirpur": {"name": "Mirpur", "district": "Dhaka", "division": "Dhaka"},
    "uttara": {"name": "Uttara", "district": "Dhaka", "division": "Dhaka"},
    "gulshan": {"name": "Gulshan", "district": "Dhaka", "division": "Dhaka"},
    "banani": {"name": "Banani", "district": "Dhaka", "division": "Dhaka"},
    "mohammadpur": {"name": "Mohammadpur", "district": "Dhaka", "division": "Dhaka"},
    "badda": {"name": "Badda", "district": "Dhaka", "division": "Dhaka"},
    "shahbagh": {"name": "Shahbagh", "district": "Dhaka", "division": "Dhaka"},
    "old dhaka": {"name": "Old Dhaka", "district": "Dhaka", "division": "Dhaka"},
    "jatrabari": {"name": "Jatrabari", "district": "Dhaka", "division": "Dhaka"},
    "dhaka": {"name": "Dhaka", "district": "Dhaka", "division": "Dhaka"},
    "chittagong": {"name": "Chittagong", "district": "Chittagong", "division": "Chattogram"},
    "chattogram": {"name": "Chittagong", "district": "Chittagong", "division": "Chattogram"},
    "agrabad": {"name": "Agrabad", "district": "Chittagong", "division": "Chattogram"},
    "sylhet": {"name": "Sylhet", "district": "Sylhet", "division": "Sylhet"},
    "zindabazar": {"name": "Zindabazar", "district": "Sylhet", "division": "Sylhet"},
    "rajshahi": {"name": "Rajshahi", "district": "Rajshahi", "division": "Rajshahi"},
    "khulna": {"name": "Khulna", "district": "Khulna", "division": "Khulna"},
    "barisal": {"name": "Barisal", "district": "Barisal", "division": "Barisal"},
    "rangpur": {"name": "Rangpur", "district": "Rangpur", "division": "Rangpur"},
    "mymensingh": {"name": "Mymensingh", "district": "Mymensingh", "division": "Mymensingh"},
    "comilla": {"name": "Comilla", "district": "Comilla", "division": "Chattogram"},
    "gazipur": {"name": "Gazipur", "district": "Gazipur", "division": "Dhaka"},
    "narayanganj": {"name": "Narayanganj", "district": "Narayanganj", "division": "Dhaka"}
}

BLOOD_GROUP_PATTERNS = [
    (r'(?i)\b(ab[\s\-]*(?:positive|\+ve))\b', 'AB+'),
    (r'(?i)\b(ab[\s\-]*(?:negative|\-ve))\b', 'AB-'),
    (r'(?i)\b(a[\s\-]*(?:positive|\+ve))\b', 'A+'),
    (r'(?i)\b(a[\s\-]*(?:negative|\-ve))\b', 'A-'),
    (r'(?i)\b(b[\s\-]*(?:positive|\+ve))\b', 'B+'),
    (r'(?i)\b(b[\s\-]*(?:negative|\-ve))\b', 'B-'),
    (r'(?i)\b(o[\s\-]*(?:positive|\+ve))\b', 'O+'),
    (r'(?i)\b(o[\s\-]*(?:negative|\-ve))\b', 'O-'),
    (r'(?i)\b(ab)[\s]*[\+]', 'AB+'),
    (r'(?i)\b(ab)[\s]*[\-]', 'AB-'),
    (r'(?i)\b(a)[\s]*[\+]', 'A+'),
    (r'(?i)\b(a)[\s]*[\-]', 'A-'),
    (r'(?i)\b(b)[\s]*[\+]', 'B+'),
    (r'(?i)\b(b)[\s]*[\-]', 'B-'),
    (r'(?i)\b(o)[\s]*[\+]', 'O+'),
    (r'(?i)\b(o)[\s]*[\-]', 'O-')
]

URGENCY_KEYWORDS = {
    "Emergency": ["emergency", "critical", "immediately", "right now", "dying", "severe", "life or death", "icu"],
    "Urgent": ["urgent", "urgently", "asap", "soon", "fast", "today", "quick"],
    "Normal": ["routine", "normal", "planned", "tomorrow", "regular"]
}

AVAILABILITY_KEYWORDS = ["available", "ready", "active", "online", "free", "present"]


def parse_natural_language_query(query_text: str) -> dict:
    """
    Parses natural language search text and returns a structured dictionary of filters:
    {
        "blood_group": "B+",
        "district": "Dhaka",
        "city_area": "Wari",
        "urgency": "Urgent",
        "availability_preference": True,
        "raw_location": "Wari, Dhaka",
        "parsed_entities": [...]
    }
    """
    if not query_text or not isinstance(query_text, str):
        return {
            "blood_group": None,
            "district": None,
            "city_area": None,
            "urgency": "Normal",
            "availability_preference": True,
            "raw_location": "",
            "parsed_entities": []
        }

    text = query_text.lower()
    parsed_entities = []

    # 1. Extract Blood Group
    extracted_blood = None
    for pattern, normalized_group in BLOOD_GROUP_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted_blood = normalized_group
            parsed_entities.append({"type": "blood_group", "value": extracted_blood, "matched_text": match.group(0)})
            break

    # 2. Extract Urgency Level
    extracted_urgency = "Normal"
    for urgency, keywords in URGENCY_KEYWORDS.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', text) for kw in keywords):
            extracted_urgency = urgency
            parsed_entities.append({"type": "urgency", "value": extracted_urgency})
            break

    # 3. Extract Availability Preference
    avail_pref = True if any(re.search(r'\b' + re.escape(kw) + r'\b', text) for kw in AVAILABILITY_KEYWORDS) else False

    # 4. Extract Location (Area, District, Division)
    # Check all locations present in query text
    found_locs = []
    for loc_key, info in BANGLADESH_LOCATIONS.items():
        pattern = r'(?i)\b' + re.escape(loc_key) + r'\b'
        if re.search(pattern, text):
            # Give higher priority to specific sub-areas than generic district/division
            is_generic = (info["name"].lower() == info["district"].lower())
            priority = 10 if not is_generic else 5
            found_locs.append((priority, len(loc_key), info))

    extracted_area = None
    extracted_district = None
    extracted_division = None

    if found_locs:
        # Sort by priority (sub-area first), then longer match
        found_locs.sort(key=lambda x: (x[0], x[1]), reverse=True)
        top_info = found_locs[0][2]
        extracted_area = top_info["name"]
        extracted_district = top_info["district"]
        extracted_division = top_info["division"]
        
        # If any other matched location specifies district or division, enrich
        for _, _, info in found_locs[1:]:
            if not extracted_district and info["district"]:
                extracted_district = info["district"]
            if not extracted_division and info["division"]:
                extracted_division = info["division"]
                
        parsed_entities.append({"type": "location", "value": extracted_area, "district": extracted_district})

    # Also build raw location string
    raw_location = ""
    if extracted_area and extracted_district:
        if extracted_area.lower() == extracted_district.lower():
            raw_location = extracted_district
        else:
            raw_location = f"{extracted_area}, {extracted_district}"
    elif extracted_district:
        raw_location = extracted_district

    return {
        "blood_group": extracted_blood,
        "district": extracted_district,
        "city_area": extracted_area,
        "division": extracted_division,
        "urgency": extracted_urgency,
        "availability_preference": avail_pref,
        "raw_location": raw_location,
        "parsed_entities": parsed_entities
    }


if __name__ == "__main__":
    # Test CLI invocation
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "I urgently need B+ blood in Wari, Dhaka."
    result = parse_natural_language_query(query)
    print(json.dumps(result, indent=2))
