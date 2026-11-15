// Bangladesh Geographic Dataset: 8 Divisions, 64 Districts, Upazilas/Thanas, and Areas

export interface Division {
  id: string;
  name: string;
  bnName: string;
  code: string;
  latitude: number;
  longitude: number;
}

export interface District {
  id: string;
  divisionId: string;
  name: string;
  bnName: string;
  code: string;
  latitude: number;
  longitude: number;
}

export interface Upazila {
  id: string;
  districtId: string;
  name: string;
  bnName: string;
  latitude: number;
  longitude: number;
}

export interface Area {
  id: string;
  upazilaId: string;
  name: string;
  bnName: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

export const DIVISIONS: Division[] = [
  { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', code: 'DHA', latitude: 23.8103, longitude: 90.4125 },
  { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', code: 'CTG', latitude: 22.3569, longitude: 91.7832 },
  { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', code: 'RAJ', latitude: 24.3636, longitude: 88.6241 },
  { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', code: 'KHU', latitude: 22.8456, longitude: 89.5403 },
  { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল', code: 'BAR', latitude: 22.7010, longitude: 90.3535 },
  { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', code: 'SYL', latitude: 24.8949, longitude: 91.8687 },
  { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', code: 'RAN', latitude: 25.7439, longitude: 89.2752 },
  { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', code: 'MYM', latitude: 24.7471, longitude: 90.4203 },
];

export const DISTRICTS: District[] = [
  // Dhaka Division (13 districts)
  { id: 'dhaka', divisionId: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', code: 'DHA', latitude: 23.8103, longitude: 90.4125 },
  { id: 'gazipur', divisionId: 'dhaka', name: 'Gazipur', bnName: 'গাজীপুর', code: 'GAZ', latitude: 23.9999, longitude: 90.4203 },
  { id: 'narayanganj', divisionId: 'dhaka', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', code: 'NAR', latitude: 23.6238, longitude: 90.5000 },
  { id: 'tangail', divisionId: 'dhaka', name: 'Tangail', bnName: 'টাঙ্গাইল', code: 'TAN', latitude: 24.2513, longitude: 89.9167 },
  { id: 'faridpur', divisionId: 'dhaka', name: 'Faridpur', bnName: 'ফরিদপুর', code: 'FAR', latitude: 23.6071, longitude: 89.8429 },
  { id: 'manikganj', divisionId: 'dhaka', name: 'Manikganj', bnName: 'মানিকগঞ্জ', code: 'MAN', latitude: 23.8644, longitude: 90.0047 },
  { id: 'munshiganj', divisionId: 'dhaka', name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', code: 'MUN', latitude: 23.5422, longitude: 90.5305 },
  { id: 'narsingdi', divisionId: 'dhaka', name: 'Narsingdi', bnName: 'নরসিংদী', code: 'NSD', latitude: 23.9322, longitude: 90.7154 },
  { id: 'gopalganj', divisionId: 'dhaka', name: 'Gopalganj', bnName: 'গোপালগঞ্জ', code: 'GOP', latitude: 23.0051, longitude: 89.8266 },
  { id: 'madaripur', divisionId: 'dhaka', name: 'Madaripur', bnName: 'মাদারীপুর', code: 'MAD', latitude: 23.1641, longitude: 90.1897 },
  { id: 'rajbari', divisionId: 'dhaka', name: 'Rajbari', bnName: 'রাজবাড়ী', code: 'RAJ-DIS', latitude: 23.7574, longitude: 89.6445 },
  { id: 'shariatpur', divisionId: 'dhaka', name: 'Shariatpur', bnName: 'শরীয়তপুর', code: 'SHA', latitude: 23.2423, longitude: 90.4348 },
  { id: 'kishoreganj', divisionId: 'dhaka', name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', code: 'KIS', latitude: 24.4449, longitude: 90.7766 },

  // Chattogram Division (11 districts)
  { id: 'chattogram', divisionId: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', code: 'CTG', latitude: 22.3569, longitude: 91.7832 },
  { id: 'coxs-bazar', divisionId: 'chattogram', name: "Cox's Bazar", bnName: 'কক্সবাজার', code: 'COX', latitude: 21.4272, longitude: 92.0058 },
  { id: 'cumilla', divisionId: 'chattogram', name: 'Cumilla', bnName: 'কুমিল্লা', code: 'CUM', latitude: 23.4682, longitude: 91.1788 },
  { id: 'feni', divisionId: 'chattogram', name: 'Feni', bnName: 'ফেনী', code: 'FEN', latitude: 23.0186, longitude: 91.3966 },
  { id: 'brahmanbaria', divisionId: 'chattogram', name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', code: 'BRA', latitude: 23.9571, longitude: 91.1119 },
  { id: 'chandpur', divisionId: 'chattogram', name: 'Chandpur', bnName: 'চাঁদপুর', code: 'CHA', latitude: 23.2333, longitude: 90.6667 },
  { id: 'noakhali', divisionId: 'chattogram', name: 'Noakhali', bnName: 'নোয়াখালী', code: 'NOA', latitude: 22.8696, longitude: 91.0994 },
  { id: 'lakshmipur', divisionId: 'chattogram', name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', code: 'LAK', latitude: 22.9425, longitude: 90.8412 },
  { id: 'khagrachhari', divisionId: 'chattogram', name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', code: 'KHA', latitude: 23.1193, longitude: 91.9847 },
  { id: 'rangamati', divisionId: 'chattogram', name: 'Rangamati', bnName: 'রাঙ্গামাটি', code: 'RAN-DIS', latitude: 22.7324, longitude: 92.2985 },
  { id: 'bandarban', divisionId: 'chattogram', name: 'Bandarban', bnName: 'বান্দরবান', code: 'BAN', latitude: 22.1953, longitude: 92.2184 },

  // Rajshahi Division (8 districts)
  { id: 'rajshahi', divisionId: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', code: 'RAJ-D', latitude: 24.3636, longitude: 88.6241 },
  { id: 'bogura', divisionId: 'rajshahi', name: 'Bogura', bnName: 'বগুড়া', code: 'BOG', latitude: 24.8465, longitude: 89.3777 },
  { id: 'pabna', divisionId: 'rajshahi', name: 'Pabna', bnName: 'পাবনা', code: 'PAB', latitude: 24.0064, longitude: 89.2372 },
  { id: 'sirajganj', divisionId: 'rajshahi', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', code: 'SIR', latitude: 24.4534, longitude: 89.7007 },
  { id: 'naogaon', divisionId: 'rajshahi', name: 'Naogaon', bnName: 'নওগাঁ', code: 'NAO', latitude: 24.7936, longitude: 88.9318 },
  { id: 'natore', divisionId: 'rajshahi', name: 'Natore', bnName: 'নাটোর', code: 'NAT', latitude: 24.4206, longitude: 89.0003 },
  { id: 'chapai-nawabganj', divisionId: 'rajshahi', name: 'Chapai Nawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', code: 'CNW', latitude: 24.5965, longitude: 88.2775 },
  { id: 'joypurhat', divisionId: 'rajshahi', name: 'Joypurhat', bnName: 'জয়পুরহাট', code: 'JOY', latitude: 25.1015, longitude: 89.0277 },

  // Khulna Division (10 districts)
  { id: 'khulna', divisionId: 'khulna', name: 'Khulna', bnName: 'খুলনা', code: 'KHU-D', latitude: 22.8456, longitude: 89.5403 },
  { id: 'jashore', divisionId: 'khulna', name: 'Jashore', bnName: 'যশোর', code: 'JAS', latitude: 23.1664, longitude: 89.2081 },
  { id: 'satkhira', divisionId: 'khulna', name: 'Satkhira', bnName: 'সাতক্ষীরা', code: 'SAT', latitude: 22.7185, longitude: 89.0705 },
  { id: 'kushtia', divisionId: 'khulna', name: 'Kushtia', bnName: 'কুষ্টিয়া', code: 'KUS', latitude: 23.9013, longitude: 89.1204 },
  { id: 'jhenaidah', divisionId: 'khulna', name: 'Jhenaidah', bnName: 'ঝিনাইদহ', code: 'JHE', latitude: 23.5448, longitude: 89.1539 },
  { id: 'bagerhat', divisionId: 'khulna', name: 'Bagerhat', bnName: 'বাগেরহাট', code: 'BAG', latitude: 22.6516, longitude: 89.7859 },
  { id: 'chuadanga', divisionId: 'khulna', name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', code: 'CHU', latitude: 23.6402, longitude: 88.8418 },
  { id: 'meherpur', divisionId: 'khulna', name: 'Meherpur', bnName: 'মেহেরপুর', code: 'MEH', latitude: 23.7622, longitude: 88.6318 },
  { id: 'narail', divisionId: 'khulna', name: 'Narail', bnName: 'নড়াইল', code: 'NRL', latitude: 23.1725, longitude: 89.5127 },
  { id: 'magura', divisionId: 'khulna', name: 'Magura', bnName: 'মাগুরা', code: 'MAG', latitude: 23.4873, longitude: 89.4199 },

  // Barishal Division (6 districts)
  { id: 'barishal', divisionId: 'barishal', name: 'Barishal', bnName: 'বরিশাল', code: 'BAR-D', latitude: 22.7010, longitude: 90.3535 },
  { id: 'patuakhali', divisionId: 'barishal', name: 'Patuakhali', bnName: 'পটুয়াখালী', code: 'PAT', latitude: 22.3596, longitude: 90.3299 },
  { id: 'bhola', divisionId: 'barishal', name: 'Bhola', bnName: 'ভোলা', code: 'BHO', latitude: 22.6859, longitude: 90.6481 },
  { id: 'pirojpur', divisionId: 'barishal', name: 'Pirojpur', bnName: 'পিরোজপুর', code: 'PIR', latitude: 22.5841, longitude: 89.9720 },
  { id: 'barguna', divisionId: 'barishal', name: 'Barguna', bnName: 'বরগুনা', code: 'BRG', latitude: 22.1570, longitude: 90.1256 },
  { id: 'jhalokati', divisionId: 'barishal', name: 'Jhalokati', bnName: 'ঝালকাঠি', code: 'JHA', latitude: 22.6406, longitude: 90.1987 },

  // Sylhet Division (4 districts)
  { id: 'sylhet', divisionId: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', code: 'SYL-D', latitude: 24.8949, longitude: 91.8687 },
  { id: 'moulvibazar', divisionId: 'sylhet', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', code: 'MOU', latitude: 24.4829, longitude: 91.7774 },
  { id: 'habiganj', divisionId: 'sylhet', name: 'Habiganj', bnName: 'হবিগঞ্জ', code: 'HAB', latitude: 24.3749, longitude: 91.4155 },
  { id: 'sunamganj', divisionId: 'sylhet', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', code: 'SUN', latitude: 25.0658, longitude: 91.3950 },

  // Rangpur Division (8 districts)
  { id: 'rangpur', divisionId: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', code: 'RAN-D', latitude: 25.7439, longitude: 89.2752 },
  { id: 'dinajpur', divisionId: 'rangpur', name: 'Dinajpur', bnName: 'দিনাজপুর', code: 'DIN', latitude: 25.6217, longitude: 88.6355 },
  { id: 'gaibandha', divisionId: 'rangpur', name: 'Gaibandha', bnName: 'গাইবান্ধা', code: 'GAI', latitude: 25.3288, longitude: 89.5407 },
  { id: 'kurigram', divisionId: 'rangpur', name: 'Kurigram', bnName: 'কুড়িগ্রাম', code: 'KUR', latitude: 25.8054, longitude: 89.6362 },
  { id: 'nilphamari', divisionId: 'rangpur', name: 'Nilphamari', bnName: 'নীলফামারী', code: 'NIL', latitude: 25.9318, longitude: 88.8560 },
  { id: 'lalmonirhat', divisionId: 'rangpur', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', code: 'LAL', latitude: 25.9923, longitude: 89.2847 },
  { id: 'panchagarh', divisionId: 'rangpur', name: 'Panchagarh', bnName: 'পঞ্চগড়', code: 'PAN', latitude: 26.3411, longitude: 88.5542 },
  { id: 'thakurgaon', divisionId: 'rangpur', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', code: 'THA', latitude: 26.0337, longitude: 88.4617 },

  // Mymensingh Division (4 districts)
  { id: 'mymensingh', divisionId: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', code: 'MYM-D', latitude: 24.7471, longitude: 90.4203 },
  { id: 'jamalpur', divisionId: 'mymensingh', name: 'Jamalpur', bnName: 'জামালপুর', code: 'JAM', latitude: 24.9375, longitude: 89.9378 },
  { id: 'netrokona', divisionId: 'mymensingh', name: 'Netrokona', bnName: 'নেত্রকোণা', code: 'NET', latitude: 24.8709, longitude: 90.7279 },
  { id: 'sherpur', divisionId: 'mymensingh', name: 'Sherpur', bnName: 'শেরপুর', code: 'SHE', latitude: 25.0205, longitude: 90.0153 },
];

export const UPAZILAS: Upazila[] = [
  // Dhaka District Thanas/Upazilas
  { id: 'wari', districtId: 'dhaka', name: 'Wari', bnName: 'ওয়ারী', latitude: 23.7196, longitude: 90.4184 },
  { id: 'dhanmondi', districtId: 'dhaka', name: 'Dhanmondi', bnName: 'ধানমন্ডি', latitude: 23.7461, longitude: 90.3742 },
  { id: 'mirpur', districtId: 'dhaka', name: 'Mirpur', bnName: 'মিরপুর', latitude: 23.8041, longitude: 90.3667 },
  { id: 'gulshan', districtId: 'dhaka', name: 'Gulshan', bnName: 'গুলশান', latitude: 23.7925, longitude: 90.4078 },
  { id: 'banani', districtId: 'dhaka', name: 'Banani', bnName: 'বনানী', latitude: 23.7937, longitude: 90.4066 },
  { id: 'mohammadpur', districtId: 'dhaka', name: 'Mohammadpur', bnName: 'মোহাম্মদপুর', latitude: 23.7542, longitude: 90.3621 },
  { id: 'uttara', districtId: 'dhaka', name: 'Uttara', bnName: 'উত্তরা', latitude: 23.8759, longitude: 90.3795 },
  { id: 'motijheel', districtId: 'dhaka', name: 'Motijheel', bnName: 'মতিঝিল', latitude: 23.7330, longitude: 90.4172 },
  { id: 'lalbagh', districtId: 'dhaka', name: 'Lalbagh', bnName: 'লালবাগ', latitude: 23.7188, longitude: 90.3881 },
  { id: 'shahbagh', districtId: 'dhaka', name: 'Shahbagh', bnName: 'শাহবাগ', latitude: 23.7388, longitude: 90.3958 },
  { id: 'tejgaon', districtId: 'dhaka', name: 'Tejgaon', bnName: 'তেজগাঁও', latitude: 23.7597, longitude: 90.3923 },
  { id: 'badda', districtId: 'dhaka', name: 'Badda', bnName: 'বাড্ডা', latitude: 23.7806, longitude: 90.4267 },
  { id: 'khilgaon', districtId: 'dhaka', name: 'Khilgaon', bnName: 'খিলগাঁও', latitude: 23.7505, longitude: 90.4344 },
  { id: 'jatrabari', districtId: 'dhaka', name: 'Jatrabari', bnName: 'যাত্রাবাড়ী', latitude: 23.7118, longitude: 90.4346 },
  { id: 'sutrapur', districtId: 'dhaka', name: 'Sutrapur', bnName: 'সূত্রাপুর', latitude: 23.7088, longitude: 90.4144 },
  { id: 'savar', districtId: 'dhaka', name: 'Savar', bnName: 'সাভার', latitude: 23.8583, longitude: 90.2667 },

  // Chattogram District Thanas
  { id: 'agrabad', districtId: 'chattogram', name: 'Agrabad', bnName: 'আগ্রাবাদ', latitude: 22.3248, longitude: 91.8126 },
  { id: 'panchlaish', districtId: 'chattogram', name: 'Panchlaish', bnName: 'পাঁচলাইশ', latitude: 22.3667, longitude: 91.8333 },
  { id: 'kotwali-ctg', districtId: 'chattogram', name: 'Kotwali (Chattogram)', bnName: 'কোতোয়ালী (চট্টগ্রাম)', latitude: 22.3384, longitude: 91.8317 },
  { id: 'halishahar', districtId: 'chattogram', name: 'Halishahar', bnName: 'হালিশহর', latitude: 22.3167, longitude: 91.7833 },

  // Sylhet District Thanas
  { id: 'zindabazar', districtId: 'sylhet', name: 'Zindabazar (Kotwali)', bnName: 'জিন্দাবাজার (কোতোয়ালী)', latitude: 24.8949, longitude: 91.8687 },
  { id: 'sylhet-sadar', districtId: 'sylhet', name: 'Sylhet Sadar', bnName: 'সিলেট সদর', latitude: 24.9122, longitude: 91.8700 },

  // Rajshahi District Thanas
  { id: 'boalia', districtId: 'rajshahi', name: 'Boalia (Rajshahi)', bnName: 'বোয়ালিয়া', latitude: 24.3636, longitude: 88.6241 },
  { id: 'rajpara', districtId: 'rajshahi', name: 'Rajpara', bnName: 'রাজপাড়া', latitude: 24.3700, longitude: 88.5800 },

  // Khulna District Thanas
  { id: 'khulna-sadar', districtId: 'khulna', name: 'Khulna Sadar', bnName: 'খুলনা সদর', latitude: 22.8167, longitude: 89.5500 },
  { id: 'sonadanga', districtId: 'khulna', name: 'Sonadanga', bnName: 'সোনাডাঙ্গা', latitude: 22.8250, longitude: 89.5350 },

  // Barishal District Thanas
  { id: 'barishal-sadar', districtId: 'barishal', name: 'Barishal Sadar', bnName: 'বরিশাল সদর', latitude: 22.7010, longitude: 90.3535 },

  // Rangpur District Thanas
  { id: 'rangpur-sadar', districtId: 'rangpur', name: 'Rangpur Sadar', bnName: 'রংপুর সদর', latitude: 25.7439, longitude: 89.2752 },

  // Mymensingh District Thanas
  { id: 'mymensingh-sadar', districtId: 'mymensingh', name: 'Mymensingh Sadar', bnName: 'ময়মনসিংহ সদর', latitude: 24.7471, longitude: 90.4203 },
];

export const AREAS: Area[] = [
  // Wari Areas
  { id: 'wari-rankin', upazilaId: 'wari', name: 'Rankin Street', bnName: 'র‍্যাংকিন স্ট্রিট', postalCode: '1203', latitude: 23.7196, longitude: 90.4184 },
  { id: 'wari-tikatuli', upazilaId: 'wari', name: 'Tikatuli', bnName: 'টিকাটুলী', postalCode: '1203', latitude: 23.7180, longitude: 90.4220 },
  { id: 'wari-narinda', upazilaId: 'wari', name: 'Narinda', bnName: 'নারিন্দা', postalCode: '1100', latitude: 23.7120, longitude: 90.4190 },
  { id: 'wari-swamibagh', upazilaId: 'wari', name: 'Swamibagh', bnName: 'স্বামীবাগ', postalCode: '1203', latitude: 23.7150, longitude: 90.4250 },
  { id: 'wari-baldha', upazilaId: 'wari', name: 'Baldha Garden Area', bnName: 'বলধা গার্ডেন এলাকা', postalCode: '1203', latitude: 23.7166, longitude: 90.4180 },

  // Dhanmondi Areas
  { id: 'dhanmondi-27', upazilaId: 'dhanmondi', name: 'Dhanmondi 27', bnName: 'ধানমন্ডি ২৭', postalCode: '1209', latitude: 23.7530, longitude: 90.3730 },
  { id: 'dhanmondi-32', upazilaId: 'dhanmondi', name: 'Dhanmondi 32', bnName: 'ধানমন্ডি ৩২', postalCode: '1209', latitude: 23.7510, longitude: 90.3780 },
  { id: 'dhanmondi-lake', upazilaId: 'dhanmondi', name: 'Dhanmondi Lake Area', bnName: 'ধানমন্ডি লেক এলাকা', postalCode: '1209', latitude: 23.7460, longitude: 90.3770 },

  // Mirpur Areas
  { id: 'mirpur-10', upazilaId: 'mirpur', name: 'Mirpur 10 Roundabout', bnName: 'মিরপুর ১০ গোলচত্বর', postalCode: '1216', latitude: 23.8070, longitude: 90.3686 },
  { id: 'mirpur-1', upazilaId: 'mirpur', name: 'Mirpur 1', bnName: 'মিরপুর ১', postalCode: '1216', latitude: 23.7950, longitude: 90.3530 },
  { id: 'mirpur-12', upazilaId: 'mirpur', name: 'Mirpur 12', bnName: 'মিরপুর ১২', postalCode: '1216', latitude: 23.8240, longitude: 90.3640 },

  // Gulshan & Banani Areas
  { id: 'gulshan-1', upazilaId: 'gulshan', name: 'Gulshan 1', bnName: 'গুলশান ১', postalCode: '1212', latitude: 23.7780, longitude: 90.4160 },
  { id: 'gulshan-2', upazilaId: 'gulshan', name: 'Gulshan 2', bnName: 'গুলশান ২', postalCode: '1212', latitude: 23.7925, longitude: 90.4165 },
  { id: 'banani-11', upazilaId: 'banani', name: 'Road 11 Banani', bnName: 'রোড ১১ বনানী', postalCode: '1213', latitude: 23.7937, longitude: 90.4040 },

  // Agrabad Areas
  { id: 'agrabad-cd', upazilaId: 'agrabad', name: 'Agrabad Commercial Area', bnName: 'আগ্রাবাদ বাণিজ্যিক এলাকা', postalCode: '4100', latitude: 22.3248, longitude: 91.8126 },
  
  // Zindabazar Areas
  { id: 'zindabazar-point', upazilaId: 'zindabazar', name: 'Zindabazar Point', bnName: 'জিন্দাবাজার পয়েন্ট', postalCode: '3100', latitude: 24.8949, longitude: 91.8687 },
];

/**
 * Calculates straight-line geographic distance using the Haversine formula (in kilometers).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}
