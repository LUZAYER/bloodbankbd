<?php
/**
 * BloodLink - Database Configuration
 * Uses PDO prepared statements for high security.
 * Supports MySQL (Default for XAMPP) with seamless SQLite fallback.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'bloodlink');

function getDBConnection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    // Try MySQL first (Standard XAMPP default)
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 2,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        // MySQL not running or database not created yet; fallback to SQLite
        $sqliteFile = dirname(__DIR__) . '/database/bloodlink.sqlite';
        if (!file_exists($sqliteFile)) {
            // Auto run setup if sqlite doesn't exist
            require_once dirname(__DIR__) . '/database/setup.php';
        }

        try {
            $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return $pdo;
        } catch (PDOException $e2) {
            die("Database connection error: " . htmlspecialchars($e2->getMessage()));
        }
    }
}

/**
 * Execute a parameterized query and fetch all rows
 */
function dbQueryAll($sql, $params = []) {
    $db = getDBConnection();
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Execute a parameterized query and fetch a single row
 */
function dbQueryOne($sql, $params = []) {
    $db = getDBConnection();
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch();
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
function dbExecute($sql, $params = []) {
    $db = getDBConnection();
    $stmt = $db->prepare($sql);
    return $stmt->execute($params);
}

/**
 * Return last insert ID
 */
function dbLastInsertId() {
    $db = getDBConnection();
    return $db->lastInsertId();
}
