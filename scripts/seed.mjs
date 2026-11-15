import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Geographic Data: 8 Divisions
const DIVISIONS = [
  { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', code: 'DHA', latitude: 23.8103, longitude: 90.4125 },
  { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', code: 'CTG', latitude: 22.3569, longitude: 91.7832 },
  { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', code: 'RAJ', latitude: 24.3636, longitude: 88.6241 },
  { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', code: 'KHU', latitude: 22.8456, longitude: 89.5403 },
  { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল', code: 'BAR', latitude: 22.7010, longitude: 90.3535 },
  { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', code: 'SYL', latitude: 24.8949, longitude: 91.8687 },
  { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', code: 'RAN', latitude: 25.7439, longitude: 89.2752 },
  { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', code: 'MYM', latitude: 24.7471, longitude: 90.4203 },
];

// All 64 Districts with coordinates
const DISTRICTS = [
  // Dhaka Division (13)
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

  // Chattogram Division (11)
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

  // Rajshahi Division (8)
  { id: 'rajshahi', divisionId: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', code: 'RAJ-D', latitude: 24.3636, longitude: 88.6241 },
  { id: 'bogura', divisionId: 'rajshahi', name: 'Bogura', bnName: 'বগুড়া', code: 'BOG', latitude: 24.8465, longitude: 89.3777 },
  { id: 'pabna', divisionId: 'rajshahi', name: 'Pabna', bnName: 'পাবনা', code: 'PAB', latitude: 24.0064, longitude: 89.2372 },
  { id: 'sirajganj', divisionId: 'rajshahi', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', code: 'SIR', latitude: 24.4534, longitude: 89.7007 },
  { id: 'naogaon', divisionId: 'rajshahi', name: 'Naogaon', bnName: 'নওগাঁ', code: 'NAO', latitude: 24.7936, longitude: 88.9318 },
  { id: 'natore', divisionId: 'rajshahi', name: 'Natore', bnName: 'নাটোর', code: 'NAT', latitude: 24.4206, longitude: 89.0003 },
  { id: 'chapai-nawabganj', divisionId: 'rajshahi', name: 'Chapai Nawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', code: 'CNW', latitude: 24.5965, longitude: 88.2775 },
  { id: 'joypurhat', divisionId: 'rajshahi', name: 'Joypurhat', bnName: 'জয়পুরহাট', code: 'JOY', latitude: 25.1015, longitude: 89.0277 },

  // Khulna Division (10)
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

  // Barishal Division (6)
  { id: 'barishal', divisionId: 'barishal', name: 'Barishal', bnName: 'বরিশাল', code: 'BAR-D', latitude: 22.7010, longitude: 90.3535 },
  { id: 'patuakhali', divisionId: 'barishal', name: 'Patuakhali', bnName: 'পটুয়াখালী', code: 'PAT', latitude: 22.3596, longitude: 90.3299 },
  { id: 'bhola', divisionId: 'barishal', name: 'Bhola', bnName: 'ভোলা', code: 'BHO', latitude: 22.6859, longitude: 90.6481 },
  { id: 'pirojpur', divisionId: 'barishal', name: 'Pirojpur', bnName: 'পিরোজপুর', code: 'PIR', latitude: 22.5841, longitude: 89.9720 },
  { id: 'barguna', divisionId: 'barishal', name: 'Barguna', bnName: 'বরগুনা', code: 'BRG', latitude: 22.1570, longitude: 90.1256 },
  { id: 'jhalokati', divisionId: 'barishal', name: 'Jhalokati', bnName: 'ঝালকাঠি', code: 'JHA', latitude: 22.6406, longitude: 90.1987 },

  // Sylhet Division (4)
  { id: 'sylhet', divisionId: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', code: 'SYL-D', latitude: 24.8949, longitude: 91.8687 },
  { id: 'moulvibazar', divisionId: 'sylhet', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', code: 'MOU', latitude: 24.4829, longitude: 91.7774 },
  { id: 'habiganj', divisionId: 'sylhet', name: 'Habiganj', bnName: 'হবিগঞ্জ', code: 'HAB', latitude: 24.3749, longitude: 91.4155 },
  { id: 'sunamganj', divisionId: 'sylhet', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', code: 'SUN', latitude: 25.0658, longitude: 91.3950 },

  // Rangpur Division (8)
  { id: 'rangpur', divisionId: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', code: 'RAN-D', latitude: 25.7439, longitude: 89.2752 },
  { id: 'dinajpur', divisionId: 'rangpur', name: 'Dinajpur', bnName: 'দিনাজপুর', code: 'DIN', latitude: 25.6217, longitude: 88.6355 },
  { id: 'gaibandha', divisionId: 'rangpur', name: 'Gaibandha', bnName: 'গাইবান্ধা', code: 'GAI', latitude: 25.3288, longitude: 89.5407 },
  { id: 'kurigram', divisionId: 'rangpur', name: 'Kurigram', bnName: 'কুড়িগ্রাম', code: 'KUR', latitude: 25.8054, longitude: 89.6362 },
  { id: 'nilphamari', divisionId: 'rangpur', name: 'Nilphamari', bnName: 'নীলফামারী', code: 'NIL', latitude: 25.9318, longitude: 88.8560 },
  { id: 'lalmonirhat', divisionId: 'rangpur', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', code: 'LAL', latitude: 25.9923, longitude: 89.2847 },
  { id: 'panchagarh', divisionId: 'rangpur', name: 'Panchagarh', bnName: 'পঞ্চগড়', code: 'PAN', latitude: 26.3411, longitude: 88.5542 },
  { id: 'thakurgaon', divisionId: 'rangpur', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', code: 'THA', latitude: 26.0337, longitude: 88.4617 },

  // Mymensingh Division (4)
  { id: 'mymensingh', divisionId: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', code: 'MYM-D', latitude: 24.7471, longitude: 90.4203 },
  { id: 'jamalpur', divisionId: 'mymensingh', name: 'Jamalpur', bnName: 'জামালপুর', code: 'JAM', latitude: 24.9375, longitude: 89.9378 },
  { id: 'netrokona', divisionId: 'mymensingh', name: 'Netrokona', bnName: 'নেত্রকোণা', code: 'NET', latitude: 24.8709, longitude: 90.7279 },
  { id: 'sherpur', divisionId: 'mymensingh', name: 'Sherpur', bnName: 'শেরপুর', code: 'SHE', latitude: 25.0205, longitude: 90.0153 },
];

const BASE_UPAZILAS = [
  // Dhaka
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

  // Chattogram
  { id: 'agrabad', districtId: 'chattogram', name: 'Agrabad', bnName: 'আগ্রাবাদ', latitude: 22.3248, longitude: 91.8126 },
  { id: 'panchlaish', districtId: 'chattogram', name: 'Panchlaish', bnName: 'পাঁচলাইশ', latitude: 22.3667, longitude: 91.8333 },
  { id: 'kotwali-ctg', districtId: 'chattogram', name: 'Kotwali (Chattogram)', bnName: 'কোতোয়ালী (চট্টগ্রাম)', latitude: 22.3384, longitude: 91.8317 },

  // Sylhet
  { id: 'zindabazar', districtId: 'sylhet', name: 'Zindabazar (Kotwali)', bnName: 'জিন্দাবাজার (কোতোয়ালী)', latitude: 24.8949, longitude: 91.8687 },
  { id: 'sylhet-sadar', districtId: 'sylhet', name: 'Sylhet Sadar', bnName: 'সিলেট সদর', latitude: 24.9122, longitude: 91.8700 },

  // Rajshahi
  { id: 'boalia', districtId: 'rajshahi', name: 'Boalia (Rajshahi)', bnName: 'বোয়ালিয়া', latitude: 24.3636, longitude: 88.6241 },
];

// Ensure every single district in Bangladesh has at least one valid Upazila in database
const ALL_UPAZILAS = [...BASE_UPAZILAS];
for (const dist of DISTRICTS) {
  if (!ALL_UPAZILAS.some((u) => u.districtId === dist.id)) {
    ALL_UPAZILAS.push({
      id: `${dist.id}-sadar`,
      districtId: dist.id,
      name: `${dist.name} Sadar`,
      bnName: `${dist.bnName} সদর`,
      latitude: dist.latitude,
      longitude: dist.longitude,
    });
  }
}

const AREAS = [
  { id: 'wari-rankin', upazilaId: 'wari', name: 'Rankin Street', bnName: 'র‍্যাংকিন স্ট্রিট', postalCode: '1203', latitude: 23.7196, longitude: 90.4184 },
  { id: 'wari-tikatuli', upazilaId: 'wari', name: 'Tikatuli', bnName: 'টিকাটুলী', postalCode: '1203', latitude: 23.7180, longitude: 90.4220 },
  { id: 'wari-narinda', upazilaId: 'wari', name: 'Narinda', bnName: 'নারিন্দা', postalCode: '1100', latitude: 23.7120, longitude: 90.4190 },
  { id: 'dhanmondi-27', upazilaId: 'dhanmondi', name: 'Dhanmondi 27', bnName: 'ধানমন্ডি ২৭', postalCode: '1209', latitude: 23.7530, longitude: 90.3730 },
  { id: 'mirpur-10', upazilaId: 'mirpur', name: 'Mirpur 10', bnName: 'মিরপুর ১০', postalCode: '1216', latitude: 23.8070, longitude: 90.3686 },
  { id: 'agrabad-cd', upazilaId: 'agrabad', name: 'Agrabad Commercial Area', bnName: 'আগ্রাবাদ বাণিজ্যিক এলাকা', postalCode: '4100', latitude: 22.3248, longitude: 91.8126 },
  { id: 'zindabazar-point', upazilaId: 'zindabazar', name: 'Zindabazar Point', bnName: 'জিন্দাবাজার পয়েন্ট', postalCode: '3100', latitude: 24.8949, longitude: 91.8687 },
];

// 100+ Realistic Bangladeshi Donors Dataset
const FIRST_NAMES = [
  'Tanvir', 'Nusrat', 'Kamal', 'Farhana', 'Sabbir', 'Sakib', 'Ayesha', 'Rakibul',
  'Mehedi', 'Shamima', 'Tareq', 'Sadia', 'Mahfuzur', 'Farzana', 'Anisur', 'Tahmina',
  'Zahid', 'Ruma', 'Nasir', 'Bilkis', 'Ariful', 'Jannatul', 'Shahadat', 'Sumaiya',
  'Golam', 'Rashedul', 'Mahmuda', 'Towhidur', 'Salma', 'Asaduzzaman', 'Sabrina',
  'Monirul', 'Afroza', 'Saiful', 'Naznin', 'Mizanur', 'Sharmin', 'Al-Amin', 'Rehana',
  'Mostafa', 'Marufa', 'Kazi', 'Shahana', 'Aminul', 'Shirin', 'Shafiqul', 'Nasima',
  'Fahim', 'Taslima', 'Imran', 'Laila', 'Habibur', 'Khadija', 'Mustafizur', 'Rumana',
  'Ashiqur', 'Dilruba', 'Zubair', 'Nafisa', 'Rabiul', 'Fariha', 'Hasan', 'Samira',
  'Zillur', 'Rokeya', 'Shoriful', 'Jesmin', 'Azizul', 'Falguni', 'Tariqul', 'Suraiya',
  'Nazmul', 'Sultana', 'Shakil', 'Tahsin', 'Badrul', 'Munira', 'Mokhlesur', 'Salina'
];

const LAST_NAMES = [
  'Ahmed', 'Jahan', 'Hossain', 'Akter', 'Rahman', 'Islam', 'Siddiqua', 'Hasan',
  'Khatun', 'Mahmud', 'Afrin', 'Haque', 'Sultana', 'Begum', 'Uddin', 'Ferdous',
  'Rabbani', 'Karim', 'Parvin', 'Yeasmin', 'Khanam', 'Kamal', 'Shafiul', 'Chowdhury',
  'Khan', 'Miah', 'Talukder', 'Bhuiyan', 'Sikder', 'Mondol', 'Sheikh', 'Banu'
];

const BLOOD_GROUPS_DIST = [
  'O+', 'O+', 'O+', 'O+', 'O+', 'O+', 'O+',
  'B+', 'B+', 'B+', 'B+', 'B+', 'B+', 'B+',
  'A+', 'A+', 'A+', 'A+', 'A+',
  'AB+', 'AB+',
  'O-', 'O-', // Rare Universal
  'A-',
  'B-',
  'AB-' // Extremely rare
];

async function main() {
  console.log('Seeding Bangladesh Geographic dataset and 100+ nationwide users...');

  // 1. Seed Divisions
  for (const div of DIVISIONS) {
    await prisma.geographicDivision.upsert({
      where: { id: div.id },
      update: div,
      create: div,
    });
  }
  console.log(`Seeded ${DIVISIONS.length} divisions.`);

  // 2. Seed Districts
  for (const dist of DISTRICTS) {
    await prisma.geographicDistrict.upsert({
      where: { id: dist.id },
      update: dist,
      create: dist,
    });
  }
  console.log(`Seeded ${DISTRICTS.length} districts.`);

  // 3. Seed Upazilas
  for (const upz of ALL_UPAZILAS) {
    await prisma.geographicUpazila.upsert({
      where: { id: upz.id },
      update: upz,
      create: upz,
    });
  }
  console.log(`Seeded ${ALL_UPAZILAS.length} upazilas / thanas.`);

  // 4. Seed Areas
  for (const area of AREAS) {
    await prisma.geographicArea.upsert({
      where: { id: area.id },
      update: area,
      create: area,
    });
  }
  console.log(`Seeded ${AREAS.length} key areas.`);

  // 5. Seed Policy
  await prisma.eligibilityPolicy.upsert({
    where: { id: 'policy-default-v1' },
    update: { intervalDays: 90, isActive: true },
    create: {
      id: 'policy-default-v1',
      name: 'Standard National Blood Safety Protocol (Bangladesh)',
      version: 1,
      intervalDays: 90,
      description: 'Minimum 90-day cooldown period for whole red blood cell donation following DGHS and WHO guidelines.',
      isActive: true,
      updatedBy: 'System Administrator',
    },
  });
  console.log('Seeded National Eligibility Policy.');

  // Password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const donorPasswordHash = await bcrypt.hash('DonorPassword123!', salt);
  const seekerPasswordHash = await bcrypt.hash('SeekerPassword123!', salt);

  // 6. Seed Admin
  await prisma.user.upsert({
    where: { phone: '01700000001' },
    update: {},
    create: {
      phone: '01700000001',
      email: 'admin@bloodbond.bd',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Seeded Admin account: admin@bloodbond.bd / AdminPassword123!');

  // 7. Seed Seekers
  const seekerUser = await prisma.user.upsert({
    where: { phone: '01811111111' },
    update: {},
    create: {
      phone: '01811111111',
      email: 'seeker@bloodbond.bd',
      passwordHash: seekerPasswordHash,
      role: 'SEEKER',
      isActive: true,
    },
  });
  console.log('Seeded Primary Seeker account: seeker@bloodbond.bd / SeekerPassword123!');

  // Seed secondary seekers across Bangladesh
  const secondarySeekers = [
    { phone: '01822222222', email: 'seeker.ctg@bloodbond.bd' },
    { phone: '01833333333', email: 'seeker.sylhet@bloodbond.bd' },
    { phone: '01844444444', email: 'seeker.rajshahi@bloodbond.bd' },
    { phone: '01855555555', email: 'seeker.khulna@bloodbond.bd' },
  ];
  for (const s of secondarySeekers) {
    await prisma.user.upsert({
      where: { phone: s.phone },
      update: {},
      create: {
        phone: s.phone,
        email: s.email,
        passwordHash: seekerPasswordHash,
        role: 'SEEKER',
        isActive: true,
      },
    });
  }

  // 8. Seed 105 Donors Across All 64 Districts of Bangladesh
  console.log('Generating 105 nationwide donors with GPS coordinates...');
  const now = new Date();
  const date140DaysAgo = new Date(now.getTime() - 140 * 24 * 60 * 60 * 1000);
  const date25DaysAgo = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);
  const cooldownEndFor25 = new Date(date25DaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000);

  // We will distribute 105 donors across all districts
  const donorsToCreate = [];

  // Dedicated core test donors first
  donorsToCreate.push(
    {
      phone: '01711111111',
      email: 'tanvir.wari@bloodbond.bd',
      fullName: 'Tanvir Ahmed',
      bloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Rankin Street, Wari',
      addressDetails: 'Flat 4B, Rankin Street, Wari, Dhaka',
      latitude: 23.7196,
      longitude: 90.4184,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: date140DaysAgo,
      nextEligibleDate: new Date(date140DaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000),
      responseRate: 0.98,
      totalDonationsCount: 6,
    },
    {
      phone: '01711111114',
      email: 'farhana.wari@bloodbond.bd',
      fullName: 'Farhana Akter (Universal Donor)',
      bloodGroup: 'O-',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Rankin Street, Wari',
      addressDetails: 'Baldha Garden Lane, Wari, Dhaka',
      latitude: 23.7198,
      longitude: 90.4189,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: date140DaysAgo,
      nextEligibleDate: new Date(date140DaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000),
      responseRate: 0.99,
      totalDonationsCount: 9,
    },
    {
      phone: '01711111113',
      email: 'kamal.wari@bloodbond.bd',
      fullName: 'Kamal Hossain (Resting in Cooldown)',
      bloodGroup: 'O+',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'wari',
      areaName: 'Narinda, Wari',
      addressDetails: 'Narinda Road, Wari, Dhaka',
      latitude: 23.7120,
      longitude: 90.4190,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      lastDonationDate: date25DaysAgo,
      nextEligibleDate: cooldownEndFor25,
      responseRate: 0.92,
      totalDonationsCount: 3,
    }
  );

  // Generate 102 more donors to reach 105 total
  let donorIdx = 4;
  const totalTarget = 105;

  for (let i = donorsToCreate.length; i < totalTarget; i++) {
    // Pick district round-robin across all 64 districts so all regions have live donors
    const district = DISTRICTS[i % DISTRICTS.length];
    const upazilasInDist = ALL_UPAZILAS.filter((u) => u.districtId === district.id);
    const upazila = upazilasInDist[i % upazilasInDist.length] || {
      id: `${district.id}-sadar`,
      name: `${district.name} Sadar`,
    };

    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const bloodGroup = BLOOD_GROUPS_DIST[i % BLOOD_GROUPS_DIST.length];

    // Jitter coordinates realistically so markers in same district spread out nicely (within 1-5 km)
    const latJitter = ((Math.sin(i * 12.34) * 0.035));
    const lngJitter = ((Math.cos(i * 56.78) * 0.035));
    const latitude = Number((district.latitude + latJitter).toFixed(5));
    const longitude = Number((district.longitude + lngJitter).toFixed(5));

    // Mobile prefix cycling
    const prefixes = ['017', '018', '019', '016', '015', '013'];
    const prefix = prefixes[i % prefixes.length];
    const paddedIndex = String(1000000 + i).slice(-7);
    const phone = `${prefix}1${paddedIndex}`;
    const email = `donor.${i + 1}@bloodbond.bd`;

    // Status: 75% Available, 15% in cooldown, 10% temporarily busy
    let availabilityStatus = 'AVAILABLE';
    let lastDonationDate = null;
    let nextEligibleDate = null;
    const mode = i % 10;

    if (mode === 7 || mode === 8) {
      // In Cooldown (donated recently)
      const daysAgo = 15 + (i % 60);
      lastDonationDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      nextEligibleDate = new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    } else if (mode === 9) {
      // Temporarily busy
      availabilityStatus = 'TEMPORARILY_BUSY';
      lastDonationDate = date140DaysAgo;
      nextEligibleDate = new Date(date140DaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000);
    } else {
      // Fully eligible available
      if (i % 2 === 0) {
        lastDonationDate = new Date(now.getTime() - (100 + (i % 150)) * 24 * 60 * 60 * 1000);
        nextEligibleDate = new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      }
    }

    const totalDonations = lastDonationDate ? Math.max(1, (i % 12)) : 0;
    const responseRate = Number((0.80 + ((i % 20) * 0.01)).toFixed(2));

    donorsToCreate.push({
      phone,
      email,
      fullName,
      bloodGroup,
      divisionId: district.divisionId,
      districtId: district.id,
      upazilaId: upazila.id,
      areaName: `${upazila.name}, ${district.name}`,
      addressDetails: `House #${(i % 50) + 1}, Road #${(i % 20) + 1}, ${upazila.name}, ${district.name}`,
      latitude,
      longitude,
      availabilityStatus,
      verificationStatus: i % 7 === 0 ? 'PENDING' : 'VERIFIED',
      lastDonationDate,
      nextEligibleDate,
      responseRate,
      totalDonationsCount: totalDonations,
    });
  }

  // Insert all donors
  for (const donor of donorsToCreate) {
    const user = await prisma.user.upsert({
      where: { phone: donor.phone },
      update: {},
      create: {
        phone: donor.phone,
        email: donor.email,
        passwordHash: donorPasswordHash,
        role: 'DONOR',
        isActive: true,
      },
    });

    await prisma.donorProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: donor.fullName,
        bloodGroup: donor.bloodGroup,
        divisionId: donor.divisionId,
        districtId: donor.districtId,
        upazilaId: donor.upazilaId,
        areaName: donor.areaName,
        addressDetails: donor.addressDetails,
        latitude: donor.latitude,
        longitude: donor.longitude,
        availabilityStatus: donor.availabilityStatus,
        verificationStatus: donor.verificationStatus,
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate: donor.nextEligibleDate,
        responseRate: donor.responseRate,
        totalDonationsCount: donor.totalDonationsCount,
      },
      create: {
        userId: user.id,
        fullName: donor.fullName,
        bloodGroup: donor.bloodGroup,
        divisionId: donor.divisionId,
        districtId: donor.districtId,
        upazilaId: donor.upazilaId,
        areaName: donor.areaName,
        addressDetails: donor.addressDetails,
        latitude: donor.latitude,
        longitude: donor.longitude,
        availabilityStatus: donor.availabilityStatus,
        verificationStatus: donor.verificationStatus,
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate: donor.nextEligibleDate,
        responseRate: donor.responseRate,
        totalDonationsCount: donor.totalDonationsCount,
      },
    });
  }
  console.log(`Seeded ${donorsToCreate.length} nationwide blood donors across Bangladesh.`);

  // 9. Seed 5 Emergency Requests in major medical centers
  const emergencyRequests = [
    {
      patientBloodGroup: 'O+',
      unitsNeeded: 2,
      hospitalName: 'Dhaka Medical College Hospital (DMCH)',
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'shahbagh',
      areaName: 'Shahbagh, Dhaka',
      latitude: 23.7260,
      longitude: 90.3976,
      emergencyPriority: 'CRITICAL',
      contactPhone: '01811111111',
      notes: 'Road traffic accident trauma surgery. 2 units of O+ RBC urgently needed within 2 hours.',
      status: 'OPEN',
    },
    {
      patientBloodGroup: 'B+',
      unitsNeeded: 1,
      hospitalName: 'Chattogram Medical College Hospital (CMCH)',
      divisionId: 'chattogram',
      districtId: 'chattogram',
      upazilaId: 'panchlaish',
      areaName: 'Panchlaish, Chattogram',
      latitude: 22.3601,
      longitude: 91.8315,
      emergencyPriority: 'URGENT',
      contactPhone: '01822222222',
      notes: 'Thalassemia patient regular transfusion scheduled for today.',
      status: 'OPEN',
    },
    {
      patientBloodGroup: 'A+',
      unitsNeeded: 2,
      hospitalName: 'Sylhet MAG Osmani Medical College Hospital',
      divisionId: 'sylhet',
      districtId: 'sylhet',
      upazilaId: 'sylhet-sadar',
      areaName: 'Kajalshah, Sylhet',
      latitude: 24.8986,
      longitude: 91.8542,
      emergencyPriority: 'CRITICAL',
      contactPhone: '01833333333',
      notes: 'Emergency cesarean delivery at labor ward. A+ whole blood required.',
      status: 'OPEN',
    },
    {
      patientBloodGroup: 'O-',
      unitsNeeded: 1,
      hospitalName: 'Rajshahi Medical College Hospital (RMCH)',
      divisionId: 'rajshahi',
      districtId: 'rajshahi',
      upazilaId: 'boalia',
      areaName: 'Laxmipur, Rajshahi',
      latitude: 24.3725,
      longitude: 88.5835,
      emergencyPriority: 'CRITICAL',
      contactPhone: '01844444444',
      notes: 'Rare O negative blood urgently needed for pediatric cardiac surgery.',
      status: 'OPEN',
    },
    {
      patientBloodGroup: 'AB+',
      unitsNeeded: 1,
      hospitalName: 'Khulna Medical College Hospital (KMCH)',
      divisionId: 'khulna',
      districtId: 'khulna',
      upazilaId: 'khulna-sadar',
      areaName: 'Boyra, Khulna',
      latitude: 22.8402,
      longitude: 89.5398,
      emergencyPriority: 'STANDARD',
      contactPhone: '01855555555',
      notes: 'Planned orthopedic surgery tomorrow morning at KMCH.',
      status: 'OPEN',
    },
  ];

  const existingRequestsCount = await prisma.bloodRequest.count();
  if (existingRequestsCount === 0) {
    for (const req of emergencyRequests) {
      await prisma.bloodRequest.create({
        data: {
          seekerId: seekerUser.id,
          patientBloodGroup: req.patientBloodGroup,
          unitsNeeded: req.unitsNeeded,
          hospitalName: req.hospitalName,
          divisionId: req.divisionId,
          districtId: req.districtId,
          upazilaId: req.upazilaId,
          areaName: req.areaName,
          latitude: req.latitude,
          longitude: req.longitude,
          requiredDate: now,
          emergencyPriority: req.emergencyPriority,
          preferredContact: 'PHONE',
          contactPhone: req.contactPhone,
          notes: req.notes,
          status: req.status,
        },
      });
    }
    console.log(`Seeded ${emergencyRequests.length} emergency requests across Bangladesh.`);
  } else {
    console.log(`Found ${existingRequestsCount} existing emergency requests. Preserving without duplicate insertion.`);
  }
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
