<?php
/**
 * BloodLink - Database Setup & Migration Script
 * Can be run from CLI: php setup.php
 * Or accessed via browser: http://localhost/BloodLink/database/setup.php
 */

header('Content-Type: text/html; charset=utf-8');

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$dbname = 'bloodlink';
$port = 3306;

$output = [];
$success = false;

// Attempt MySQL connection
try {
    $output[] = "Connecting to MySQL server at {$host}:{$port}...";
    $pdo = new PDO("mysql:host={$host};port={$port}", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $output[] = "<span style='color:green'>✓ Connected to MySQL server successfully.</span>";

    // Create database if not exists
    $output[] = "Ensuring database `{$dbname}` exists...";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `{$dbname}`;");
    $output[] = "<span style='color:green'>✓ Database `{$dbname}` is ready.</span>";

    // Run schema
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $output[] = "Applying schema from schema.sql...";
        $sql = file_get_contents($schemaFile);
        $pdo->exec($sql);
        $output[] = "<span style='color:green'>✓ Tables created successfully.</span>";
    }

    // Run seed data
    $seedFile = __DIR__ . '/seed_data.sql';
    if (file_exists($seedFile)) {
        $output[] = "Seeding demo records and Bangladesh geographic data...";
        $sql = file_get_contents($seedFile);
        $pdo->exec($sql);
        $output[] = "<span style='color:green'>✓ Seed data inserted successfully.</span>";
    }

    $stmt = $pdo->query("SELECT COUNT(*) FROM donors");
    $donorCount = $stmt->fetchColumn();
    $stmt = $pdo->query("SELECT COUNT(*) FROM locations");
    $locCount = $stmt->fetchColumn();
    $output[] = "<strong>Current Database Status:</strong> {$donorCount} donors, {$locCount} Bangladesh locations ready.";
    $success = true;

} catch (Exception $e) {
    $output[] = "<span style='color:#b91c1c'>MySQL Notice: " . htmlspecialchars($e->getMessage()) . "</span>";
    $output[] = "<em>Note: If running in XAMPP, ensure MySQL is started in XAMPP Control Panel.</em>";

    // Also prepare fallback SQLite database so testing/offline use works flawlessly
    try {
        $sqlitePath = __DIR__ . '/bloodlink.sqlite';
        $output[] = "Initializing fallback SQLite database at: {$sqlitePath}...";
        $sqlitePdo = new PDO("sqlite:" . $sqlitePath);
        $sqlitePdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // SQLite compatible schema
        $sqlitePdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS donors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NULL,
                name TEXT NOT NULL,
                blood_group TEXT NOT NULL,
                age INTEGER NOT NULL,
                location TEXT NOT NULL,
                district TEXT NOT NULL,
                division TEXT NOT NULL DEFAULT 'Dhaka',
                latitude REAL NULL,
                longitude REAL NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                last_donated TEXT NULL,
                available INTEGER NOT NULL DEFAULT 1,
                total_donations INTEGER NOT NULL DEFAULT 0,
                response_rate REAL NOT NULL DEFAULT 85.00,
                registered_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                district TEXT NOT NULL,
                division TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS search_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT NULL,
                blood_group TEXT NULL,
                location_input TEXT NULL,
                urgency TEXT DEFAULT 'Normal',
                results_found INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // Seed SQLite if empty
        $cnt = $sqlitePdo->query("SELECT COUNT(*) FROM donors")->fetchColumn();
        if ($cnt == 0) {
            // Seed SQLite
            $sqlitePdo->exec("
                INSERT OR IGNORE INTO users (id, username, password, role, name, email, phone) VALUES
                (1, 'admin', 'admin123', 'admin', 'System Administrator', 'admin@bloodlink.com', '01700-000000'),
                (2, 'donor1', 'donor123', 'donor', 'Md. Rafiqul Islam', 'rafiq@gmail.com', '01711-234567'),
                (3, 'donor2', 'donor456', 'donor', 'Sumaiya Akter', 'sumaiya@gmail.com', '01812-345678'),
                (4, 'user1', 'user123', 'user', 'Karim Hossain', 'karim@gmail.com', '01515-678901');

                INSERT OR IGNORE INTO locations (id, name, district, division, latitude, longitude) VALUES
                (1, 'Wari', 'Dhaka', 'Dhaka', 23.7188, 90.4190),
                (2, 'Motijheel', 'Dhaka', 'Dhaka', 23.7330, 90.4172),
                (3, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7461, 90.3742),
                (4, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067, 90.3687),
                (5, 'Uttara', 'Dhaka', 'Dhaka', 23.8759, 90.3795),
                (6, 'Gulshan', 'Dhaka', 'Dhaka', 23.7925, 90.4078),
                (7, 'Banani', 'Dhaka', 'Dhaka', 23.7937, 90.4037),
                (8, 'Mohammadpur', 'Dhaka', 'Dhaka', 23.7658, 90.3584),
                (9, 'Badda', 'Dhaka', 'Dhaka', 23.7806, 90.4267),
                (10, 'Old Dhaka', 'Dhaka', 'Dhaka', 23.7104, 90.4074),
                (11, 'Shahbagh', 'Dhaka', 'Dhaka', 23.7383, 90.3956),
                (12, 'Khilgaon', 'Dhaka', 'Dhaka', 23.7516, 90.4223),
                (13, 'Jatrabari', 'Dhaka', 'Dhaka', 23.7118, 90.4342),
                (14, 'Dhaka', 'Dhaka', 'Dhaka', 23.8103, 90.4125),
                (15, 'Chittagong', 'Chittagong', 'Chattogram', 22.3569, 91.7832),
                (16, 'Agrabad', 'Chittagong', 'Chattogram', 22.3278, 91.8123),
                (17, 'Sylhet', 'Sylhet', 'Sylhet', 24.8949, 91.8687),
                (18, 'Zindabazar', 'Sylhet', 'Sylhet', 24.8988, 91.8719),
                (19, 'Rajshahi', 'Rajshahi', 'Rajshahi', 24.3745, 88.6042),
                (20, 'Khulna', 'Khulna', 'Khulna', 22.8456, 89.5403),
                (21, 'Barisal', 'Barisal', 'Barisal', 22.7010, 90.3535),
                (22, 'Rangpur', 'Rangpur', 'Rangpur', 25.7439, 89.2752),
                (23, 'Mymensingh', 'Mymensingh', 'Mymensingh', 24.7471, 90.4203),
                (24, 'Comilla', 'Comilla', 'Chattogram', 23.4607, 91.1809),
                (25, 'Gazipur', 'Gazipur', 'Dhaka', 23.9999, 90.4203),
                (26, 'Narayanganj', 'Narayanganj', 'Dhaka', 23.6238, 90.5000);

                INSERT OR IGNORE INTO donors (id, user_id, name, blood_group, age, location, district, division, latitude, longitude, phone, email, last_donated, available, total_donations, response_rate, registered_at) VALUES
                (1, 2, 'Md. Rafiqul Islam', 'A+', 28, 'Wari', 'Dhaka', 'Dhaka', 23.7188, 90.4190, '01711-234567', 'rafiq@gmail.com', '2024-11-10', 1, 3, 94.50, '2024-01-15'),
                (2, 3, 'Sumaiya Akter', 'B+', 24, 'Chittagong', 'Chittagong', 'Chattogram', 22.3569, 91.7832, '01812-345678', 'sumaiya@gmail.com', '2024-10-05', 1, 1, 88.00, '2024-02-20'),
                (3, NULL, 'Tanvir Ahmed', 'O+', 35, 'Sylhet', 'Sylhet', 'Sylhet', 24.8949, 91.8687, '01611-456789', 'tanvir@gmail.com', '2024-09-20', 1, 5, 96.00, '2023-11-10'),
                (4, NULL, 'Fatema Begum', 'AB+', 31, 'Rajshahi', 'Rajshahi', 'Rajshahi', 24.3745, 88.6042, '01912-567890', 'fatema@gmail.com', '2024-12-01', 1, 2, 85.00, '2024-03-05'),
                (5, NULL, 'Kamal Uddin', 'O-', 42, 'Motijheel', 'Dhaka', 'Dhaka', 23.7330, 90.4172, '01515-678901', 'kamal@gmail.com', '2024-08-15', 0, 7, 91.00, '2023-06-22'),
                (6, NULL, 'Nusrat Jahan', 'A-', 26, 'Khulna', 'Khulna', 'Khulna', 22.8456, 89.5403, '01619-789012', 'nusrat@gmail.com', '2024-07-30', 1, 1, 82.50, '2024-05-10'),
                (7, NULL, 'Arif Hossain', 'B-', 33, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067, 90.3687, '01744-890123', 'arif@gmail.com', '2024-06-14', 1, 4, 93.00, '2023-09-18'),
                (8, NULL, 'Riya Das', 'AB-', 22, 'Barisal', 'Barisal', 'Barisal', 22.7010, 90.3535, '01855-901234', 'riya@gmail.com', '2024-05-20', 1, 1, 79.00, '2024-04-01'),
                (9, NULL, 'Tariqul Anam', 'B+', 29, 'Wari', 'Dhaka', 'Dhaka', 23.7192, 90.4185, '01722-112233', 'tariqul@gmail.com', '2024-08-10', 1, 6, 98.00, '2023-05-12'),
                (10, NULL, 'Sadia Afrin', 'B+', 27, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7461, 90.3742, '01833-223344', 'sadia@gmail.com', '2024-09-15', 1, 3, 90.00, '2023-08-20'),
                (11, NULL, 'Mahmud Hasan', 'O+', 32, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067, 90.3687, '01944-334455', 'mahmud@gmail.com', '2024-07-22', 1, 8, 97.50, '2022-10-15'),
                (12, NULL, 'Zubair Rahman', 'O+', 25, 'Uttara', 'Dhaka', 'Dhaka', 23.8759, 90.3795, '01566-445566', 'zubair@gmail.com', '2024-11-28', 1, 2, 87.00, '2024-02-11'),
                (13, NULL, 'Farhana Yesmin', 'O-', 30, 'Gulshan', 'Dhaka', 'Dhaka', 23.7925, 90.4078, '01677-556677', 'farhana@gmail.com', '2024-05-18', 1, 5, 95.00, '2023-03-01'),
                (14, NULL, 'Nazmul Huda', 'A+', 34, 'Mohammadpur', 'Dhaka', 'Dhaka', 23.7658, 90.3584, '01788-667788', 'nazmul@gmail.com', '2024-10-12', 1, 4, 92.00, '2023-07-19'),
                (15, NULL, 'Tasnim Shanta', 'AB+', 23, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7480, 90.3760, '01899-778899', 'tasnim@gmail.com', '2024-11-01', 1, 2, 89.00, '2024-01-25'),
                (16, NULL, 'Imran Kabir', 'B-', 38, 'Old Dhaka', 'Dhaka', 'Dhaka', 23.7104, 90.4074, '01311-889900', 'imran@gmail.com', '2024-04-10', 1, 9, 99.00, '2022-01-10'),
                (17, NULL, 'Shakil Ahmed', 'A-', 31, 'Agrabad', 'Chittagong', 'Chattogram', 22.3278, 91.8123, '01422-990011', 'shakil@gmail.com', '2024-06-25', 1, 3, 86.00, '2023-12-05'),
                (18, NULL, 'Mehedi Hasan', 'AB-', 28, 'Zindabazar', 'Sylhet', 'Sylhet', 24.8988, 91.8719, '01533-001122', 'mehedi@gmail.com', '2024-08-30', 1, 2, 84.00, '2024-03-14'),
                (19, NULL, 'Sultan Mahmud', 'B+', 40, 'Wari', 'Dhaka', 'Dhaka', 23.7180, 90.4200, '01644-112244', 'sultan@gmail.com', '2024-12-05', 0, 5, 88.00, '2023-04-18'),
                (20, NULL, 'Ayesha Siddiqua', 'O+', 26, 'Shahbagh', 'Dhaka', 'Dhaka', 23.7383, 90.3956, '01755-223355', 'ayesha@gmail.com', '2024-09-02', 1, 4, 93.50, '2023-11-20');
            ");
        }
        $output[] = "<span style='color:green'>✓ Fallback SQLite database initialized successfully.</span>";
        $success = true;
    } catch (Exception $e2) {
        $output[] = "<span style='color:#b91c1c'>SQLite Error: " . htmlspecialchars($e2->getMessage()) . "</span>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BloodLink Database Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 40px; color: #1f2937; }
        .box { max-width: 650px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        h1 { color: #c0392b; margin-top: 0; font-size: 24px; border-bottom: 2px solid #fef2f2; padding-bottom: 12px; }
        .log { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; line-height: 1.8; margin: 20px 0; }
        .btn { display: inline-block; background: #c0392b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; }
        .btn:hover { background: #922b21; }
    </style>
</head>
<body>
<div class="box">
    <h1>BloodLink Database Setup</h1>
    <div class="log">
        <?php foreach ($output as $line): ?>
            <div><?= $line ?></div>
        <?php endforeach; ?>
    </div>
    <?php if ($success): ?>
        <p style="color:green;font-weight:600;">Setup complete! The database is ready for BloodLink.</p>
        <a href="../index.php" class="btn">Go to BloodLink Home</a>
    <?php else: ?>
        <p style="color:#b91c1c;">Please verify your database credentials and try again.</p>
    <?php endif; ?>
</div>
</body>
</html>
