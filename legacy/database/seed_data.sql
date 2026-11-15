-- ============================================================
-- BloodLink Seed Data
-- ============================================================

-- Clear existing data (if any)
DELETE FROM search_logs;
DELETE FROM donors;
DELETE FROM users;
DELETE FROM locations;

-- Reset Auto Increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE donors AUTO_INCREMENT = 1;
ALTER TABLE locations AUTO_INCREMENT = 1;

-- Users (Demo accounts from original project)
INSERT INTO users (id, username, password, role, name, email, phone, created_at) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', 'admin@bloodlink.com', '01700-000000', NOW()),
(2, 'donor1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'donor', 'Md. Rafiqul Islam', 'rafiq@gmail.com', '01711-234567', NOW()),
(3, 'donor2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'donor', 'Sumaiya Akter', 'sumaiya@gmail.com', '01812-345678', NOW()),
(4, 'user1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Karim Hossain', 'karim@gmail.com', '01515-678901', NOW());

-- Locations Reference Table (Bangladesh Districts & Key Neighborhoods)
INSERT INTO locations (id, name, district, division, latitude, longitude) VALUES
-- Dhaka Neighborhoods
(1, 'Wari', 'Dhaka', 'Dhaka', 23.7188000, 90.4190000),
(2, 'Motijheel', 'Dhaka', 'Dhaka', 23.7330000, 90.4172000),
(3, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7461000, 90.3742000),
(4, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067000, 90.3687000),
(5, 'Uttara', 'Dhaka', 'Dhaka', 23.8759000, 90.3795000),
(6, 'Gulshan', 'Dhaka', 'Dhaka', 23.7925000, 90.4078000),
(7, 'Banani', 'Dhaka', 'Dhaka', 23.7937000, 90.4037000),
(8, 'Mohammadpur', 'Dhaka', 'Dhaka', 23.7658000, 90.3584000),
(9, 'Badda', 'Dhaka', 'Dhaka', 23.7806000, 90.4267000),
(10, 'Old Dhaka', 'Dhaka', 'Dhaka', 23.7104000, 90.4074000),
(11, 'Shahbagh', 'Dhaka', 'Dhaka', 23.7383000, 90.3956000),
(12, 'Khilgaon', 'Dhaka', 'Dhaka', 23.7516000, 90.4223000),
(13, 'Jatrabari', 'Dhaka', 'Dhaka', 23.7118000, 90.4342000),
(14, 'Dhaka', 'Dhaka', 'Dhaka', 23.8103000, 90.4125000),

-- Major Districts
(15, 'Chittagong', 'Chittagong', 'Chattogram', 22.3569000, 91.7832000),
(16, 'Agrabad', 'Chittagong', 'Chattogram', 22.3278000, 91.8123000),
(17, 'Sylhet', 'Sylhet', 'Sylhet', 24.8949000, 91.8687000),
(18, 'Zindabazar', 'Sylhet', 'Sylhet', 24.8988000, 91.8719000),
(19, 'Rajshahi', 'Rajshahi', 'Rajshahi', 24.3745000, 88.6042000),
(20, 'Khulna', 'Khulna', 'Khulna', 22.8456000, 89.5403000),
(21, 'Barisal', 'Barisal', 'Barisal', 22.7010000, 90.3535000),
(22, 'Rangpur', 'Rangpur', 'Rangpur', 25.7439000, 89.2752000),
(23, 'Mymensingh', 'Mymensingh', 'Mymensingh', 24.7471000, 90.4203000),
(24, 'Comilla', 'Comilla', 'Chattogram', 23.4607000, 91.1809000),
(25, 'Gazipur', 'Gazipur', 'Dhaka', 23.9999000, 90.4203000),
(26, 'Narayanganj', 'Narayanganj', 'Dhaka', 23.6238000, 90.5000000);

-- Donors (Rich, realistic profiles covering all 8 blood groups and Bangladesh regions)
INSERT INTO donors (id, user_id, name, blood_group, age, location, district, division, latitude, longitude, phone, email, last_donated, available, total_donations, response_rate, registered_at) VALUES
(1, 2, 'Md. Rafiqul Islam', 'A+', 28, 'Wari', 'Dhaka', 'Dhaka', 23.7188000, 90.4190000, '01711-234567', 'rafiq@gmail.com', '2024-11-10', 1, 3, 94.50, '2024-01-15'),
(2, 3, 'Sumaiya Akter', 'B+', 24, 'Chittagong', 'Chittagong', 'Chattogram', 22.3569000, 91.7832000, '01812-345678', 'sumaiya@gmail.com', '2024-10-05', 1, 1, 88.00, '2024-02-20'),
(3, NULL, 'Tanvir Ahmed', 'O+', 35, 'Sylhet', 'Sylhet', 'Sylhet', 24.8949000, 91.8687000, '01611-456789', 'tanvir@gmail.com', '2024-09-20', 1, 5, 96.00, '2023-11-10'),
(4, NULL, 'Fatema Begum', 'AB+', 31, 'Rajshahi', 'Rajshahi', 'Rajshahi', 24.3745000, 88.6042000, '01912-567890', 'fatema@gmail.com', '2024-12-01', 1, 2, 85.00, '2024-03-05'),
(5, NULL, 'Kamal Uddin', 'O-', 42, 'Motijheel', 'Dhaka', 'Dhaka', 23.7330000, 90.4172000, '01515-678901', 'kamal@gmail.com', '2024-08-15', 0, 7, 91.00, '2023-06-22'),
(6, NULL, 'Nusrat Jahan', 'A-', 26, 'Khulna', 'Khulna', 'Khulna', 22.8456000, 89.5403000, '01619-789012', 'nusrat@gmail.com', '2024-07-30', 1, 1, 82.50, '2024-05-10'),
(7, NULL, 'Arif Hossain', 'B-', 33, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067000, 90.3687000, '01744-890123', 'arif@gmail.com', '2024-06-14', 1, 4, 93.00, '2023-09-18'),
(8, NULL, 'Riya Das', 'AB-', 22, 'Barisal', 'Barisal', 'Barisal', 22.7010000, 90.3535000, '01855-901234', 'riya@gmail.com', '2024-05-20', 1, 1, 79.00, '2024-04-01'),

-- Additional diverse donors for robust search & ranking tests in Dhaka & nationwide
(9, NULL, 'Tariqul Anam', 'B+', 29, 'Wari', 'Dhaka', 'Dhaka', 23.7192000, 90.4185000, '01722-112233', 'tariqul@gmail.com', '2024-08-10', 1, 6, 98.00, '2023-05-12'),
(10, NULL, 'Sadia Afrin', 'B+', 27, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7461000, 90.3742000, '01833-223344', 'sadia@gmail.com', '2024-09-15', 1, 3, 90.00, '2023-08-20'),
(11, NULL, 'Mahmud Hasan', 'O+', 32, 'Mirpur', 'Dhaka', 'Dhaka', 23.8067000, 90.3687000, '01944-334455', 'mahmud@gmail.com', '2024-07-22', 1, 8, 97.50, '2022-10-15'),
(12, NULL, 'Zubair Rahman', 'O+', 25, 'Uttara', 'Dhaka', 'Dhaka', 23.8759000, 90.3795000, '01566-445566', 'zubair@gmail.com', '2024-11-28', 1, 2, 87.00, '2024-02-11'),
(13, NULL, 'Farhana Yesmin', 'O-', 30, 'Gulshan', 'Dhaka', 'Dhaka', 23.7925000, 90.4078000, '01677-556677', 'farhana@gmail.com', '2024-05-18', 1, 5, 95.00, '2023-03-01'),
(14, NULL, 'Nazmul Huda', 'A+', 34, 'Mohammadpur', 'Dhaka', 'Dhaka', 23.7658000, 90.3584000, '01788-667788', 'nazmul@gmail.com', '2024-10-12', 1, 4, 92.00, '2023-07-19'),
(15, NULL, 'Tasnim Shanta', 'AB+', 23, 'Dhanmondi', 'Dhaka', 'Dhaka', 23.7480000, 90.3760000, '01899-778899', 'tasnim@gmail.com', '2024-11-01', 1, 2, 89.00, '2024-01-25'),
(16, NULL, 'Imran Kabir', 'B-', 38, 'Old Dhaka', 'Dhaka', 'Dhaka', 23.7104000, 90.4074000, '01311-889900', 'imran@gmail.com', '2024-04-10', 1, 9, 99.00, '2022-01-10'),
(17, NULL, 'Shakil Ahmed', 'A-', 31, 'Agrabad', 'Chittagong', 'Chattogram', 22.3278000, 91.8123000, '01422-990011', 'shakil@gmail.com', '2024-06-25', 1, 3, 86.00, '2023-12-05'),
(18, NULL, 'Mehedi Hasan', 'AB-', 28, 'Zindabazar', 'Sylhet', 'Sylhet', 24.8988000, 91.8719000, '01533-001122', 'mehedi@gmail.com', '2024-08-30', 1, 2, 84.00, '2024-03-14'),
(19, NULL, 'Sultan Mahmud', 'B+', 40, 'Wari', 'Dhaka', 'Dhaka', 23.7180000, 90.4200000, '01644-112244', 'sultan@gmail.com', '2024-12-05', 0, 5, 88.00, '2023-04-18'),
(20, NULL, 'Ayesha Siddiqua', 'O+', 26, 'Shahbagh', 'Dhaka', 'Dhaka', 23.7383000, 90.3956000, '01755-223355', 'ayesha@gmail.com', '2024-09-02', 1, 4, 93.50, '2023-11-20');
