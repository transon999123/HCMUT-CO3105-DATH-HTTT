-- =============================================
-- PHẦN 1: RESET DATABASE
-- =============================================
-- Tắt kiểm tra khóa ngoại tạm thời để tránh lỗi khi drop
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa database cũ nếu tồn tại để làm sạch hoàn toàn
DROP DATABASE IF EXISTS EduClassDB;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PHẦN 2: TẠO MỚI
-- =============================================

CREATE DATABASE EduClassDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE EduClassDB;

-- 1. Bảng User (Gộp Student, Admin, Teacher)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,       
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    middle_name VARCHAR(50),
    
    gender ENUM('Male', 'Female', 'Other'),
    date_of_birth DATE,
    
    role ENUM('Admin', 'Teacher', 'Student') NOT NULL,
    
    -- Thuộc tính riêng
    experience_years INT,
    teacher_start_date DATE,
    admin_start_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Class (Lớp học)
CREATE TABLE Classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_description TEXT,
    
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(50), 
    
    created_by_admin_id INT,
    teacher_id INT,
    
    FOREIGN KEY (created_by_admin_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 3. Bảng Enrollments (Sinh viên đăng ký lớp)
CREATE TABLE Enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrolled_date DATE DEFAULT (CURRENT_DATE),
    
    UNIQUE(student_id, class_id), 
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
);

-- 4. Bảng Materials (Tài liệu)
CREATE TABLE Materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(50), 
    material_url TEXT,         
    
    uploaded_by_teacher_id INT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_edit_date DATETIME,
    
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_teacher_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 5. Bảng Assignments (Bài tập)
CREATE TABLE Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    start_date DATETIME,
    end_date DATETIME,
    scale INT DEFAULT 10, 
    
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
);

-- 6. Bảng Submissions (Nộp bài)
CREATE TABLE Submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    
    submission_file_url TEXT, 
    submission_description TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    score DECIMAL(5, 2), 
    teacher_comment TEXT,
    score_breakdown JSON, 
    
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- =============================================
-- PHẦN 3: DỮ LIỆU MẪU (Mock Data) - Để test ngay
-- =============================================

-- Tạo 1 Admin
INSERT INTO Users (username, password, email, role, admin_start_date) 
VALUES ('admin1', '123456', 'admin@hcmut.edu.vn', 'Admin', CURDATE());

-- Tạo 1 Teacher
INSERT INTO Users (username, password, email, role, experience_years) 
VALUES ('teacher1', '123456', 'gv@hcmut.edu.vn', 'Teacher', 5);

-- Tạo 2 Student
INSERT INTO Users (username, password, email, role) 
VALUES ('student1', '123456', 'sv1@hcmut.edu.vn', 'Student'),
       ('student2', '123456', 'sv2@hcmut.edu.vn', 'Student');