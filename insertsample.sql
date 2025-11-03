use skoolmgm;
go
SET IDENTITY_INSERT users ON;

INSERT INTO users (UserID, DateofBirth, Gender, Email, Passwords, FirstName, LastName, MiddleName) VALUES
-- Students (1-5)
(1, '2005-03-15', 'Male', 'john.doe@student.edu', 'hashed_password_1', 'John', 'Doe', 'Michael'),
(2, '2004-07-22', 'Female', 'jane.smith@student.edu', 'hashed_password_2', 'Jane', 'Smith', 'Elizabeth'),
(3, '2005-11-08', 'Male', 'bob.johnson@student.edu', 'hashed_password_3', 'Bob', 'Johnson', NULL),
(4, '2004-01-30', 'Female', 'alice.williams@student.edu', 'hashed_password_4', 'Alice', 'Williams', 'Marie'),
(5, '2005-05-17', 'Male', 'charlie.brown@student.edu', 'hashed_password_5', 'Charlie', 'Brown', 'James'),
-- Teachers (6-8)
(6, '1985-06-12', 'Female', 'sarah.davis@school.edu', 'hashed_password_6', 'Sarah', 'Davis', 'Ann'),
(7, '1982-09-25', 'Male', 'michael.wilson@school.edu', 'hashed_password_7', 'Michael', 'Wilson', 'Robert'),
(8, '1990-02-14', 'Female', 'emma.taylor@school.edu', 'hashed_password_8', 'Emma', 'Taylor', 'Grace'),
-- Admins (9-10)
(9, '1978-04-20', 'Male', 'admin.jones@school.edu', 'hashed_password_9', 'Richard', 'Jones', 'Paul'),
(10, '1980-12-05', 'Female', 'admin.martinez@school.edu', 'hashed_password_10', 'Maria', 'Martinez', 'Isabel');

SET IDENTITY_INSERT users OFF;
GO

-- Insert Students
INSERT INTO STUDENT (UserID) VALUES (1), (2), (3), (4), (5);
GO

-- Insert Teachers
INSERT INTO TEACHER (UserID, Experience, TeacherFromDate) VALUES
(6, 10, '2014-08-15'),
(7, 15, '2009-08-20'),
(8, 5, '2019-08-25');
GO

-- Insert Admins
INSERT INTO ADMINS (UserID, AdminFromDate) VALUES
(9, '2010-01-15'),
(10, '2015-06-01');

-- Insert Phone Numbers
INSERT INTO USER_PHONE (UserID, PhoneNumber) VALUES
(1, '555-0101'),
(2, '555-0102'),
(3, '555-0103'),
(4, '555-0104'),
(5, '555-0105'),
(6, '555-0201'),
(6, '555-0202'), -- Teacher with 2 phones
(7, '555-0203'),
(8, '555-0204'),
(9, '555-0301'),
(10, '555-0302');

-- Insert Classes
SET IDENTITY_INSERT CLASS ON;

INSERT INTO CLASS (ClassID, ClassName, ClassDescription, DaysofWeek, ClassStartTime, ClassEndTime, AdminCreate, Teacher) VALUES
(1, 'Introduction to Programming', 'Learn the basics of programming using Python', 'Mon,Wed,Fri', '09:00:00', '10:30:00', 9, 6),
(2, 'Web Development Fundamentals', 'HTML, CSS, and JavaScript basics', 'Tue,Thu', '10:00:00', '11:30:00', 9, 7),
(3, 'Database Design', 'Learn SQL and database design principles', 'Mon,Wed', '14:00:00', '15:30:00', 10, 8),
(4, 'Data Structures and Algorithms', 'Advanced programming concepts', 'Tue,Thu', '13:00:00', '14:30:00', 9, 6),
(5, 'Mobile App Development', 'Build mobile applications', 'Fri', '15:00:00', '17:00:00', 10, 7);

SET IDENTITY_INSERT CLASS OFF;

-- Enroll Students in Classes
INSERT INTO ENROLL (StudentID, ClassID,state_of_enroll) VALUES
-- John Doe in 3 classes
(1, 1, 'Active'),
(1, 2, 'Active'),
(1, 3, 'Active'),
-- Jane Smith in 4 classes
(2, 1, 'Active'),
(2, 2, 'Active'),
(2, 4, 'Active'),
(2, 5, 'Active'),
-- Bob Johnson in 2 classes
(3, 1, 'Active'),
(3, 3, 'Active'),
-- Alice Williams in 3 classes
(4, 2, 'Active'),
(4, 4, 'Active'),
(4, 5, 'Active'),
-- Charlie Brown in 2 classes
(5, 3, 'Active'),
(5, 4, 'Active');

-- Insert Materials
SET IDENTITY_INSERT MATERIAL ON;

INSERT INTO MATERIAL (MaterialID, MaterialURL, MaterialType, MaterialTitle, ClassID) VALUES
-- Class 1 materials
(1, 'https://example.com/python-intro.pdf', 'PDF', 'Python Introduction Guide', 1),
(2, 'https://example.com/python-exercises.pdf', 'PDF', 'Practice Exercises - Week 1', 1),
(3, 'https://example.com/python-lecture1.mp4', 'Video', 'Lecture 1: Variables and Data Types', 1),
-- Class 2 materials
(4, 'https://example.com/html-basics.pdf', 'PDF', 'HTML Fundamentals', 2),
(5, 'https://example.com/css-guide.pdf', 'PDF', 'CSS Styling Guide', 2),
(6, 'https://example.com/js-intro.pdf', 'PDF', 'JavaScript Basics', 2),
-- Class 3 materials
(7, 'https://example.com/sql-tutorial.pdf', 'PDF', 'SQL Tutorial', 3),
(8, 'https://example.com/db-design.pdf', 'PDF', 'Database Design Principles', 3),
-- Class 4 materials
(9, 'https://example.com/algorithms.pdf', 'PDF', 'Algorithm Analysis', 4),
(10, 'https://example.com/data-structures.pdf', 'PDF', 'Common Data Structures', 4),
-- Class 5 materials
(11, 'https://example.com/mobile-dev.pdf', 'PDF', 'Mobile Development Overview', 5),
(12, 'https://example.com/react-native.pdf', 'PDF', 'React Native Basics', 5);

SET IDENTITY_INSERT MATERIAL OFF;

-- Insert Assignments
SET IDENTITY_INSERT ASSIGNMENT ON;

INSERT INTO ASSIGNMENT (AssignmentID, AssignmentStartDate, AssignmentStartTime, AssignmentEndDate, AssignmentEndTime, AssignmentDescription, AssignmentName, ClassID) VALUES
-- Class 1 assignments
(1, '2024-09-01', '00:00:00', '2024-09-08', '23:59:00', 'Write a Python program that calculates the factorial of a number', 'Assignment 1: Factorial Calculator', 1),
(2, '2024-09-10', '00:00:00', '2024-09-17', '23:59:00', 'Create a simple calculator using Python', 'Assignment 2: Simple Calculator', 1),
-- Class 2 assignments
(3, '2024-09-05', '00:00:00', '2024-09-12', '23:59:00', 'Create a personal portfolio webpage', 'Assignment 1: Portfolio Website', 2),
(4, '2024-09-15', '00:00:00', '2024-09-22', '23:59:00', 'Build a responsive navigation menu', 'Assignment 2: Responsive Menu', 2),
-- Class 3 assignments
(5, '2024-09-03', '00:00:00', '2024-09-10', '23:59:00', 'Design a database schema for a library system', 'Assignment 1: Library Database Design', 3),
(6, '2024-09-12', '00:00:00', '2024-09-19', '23:59:00', 'Write complex SQL queries', 'Assignment 2: Advanced SQL Queries', 3),
-- Class 4 assignments
(7, '2024-09-06', '00:00:00', '2024-09-13', '23:59:00', 'Implement a binary search tree', 'Assignment 1: Binary Search Tree', 4),
-- Class 5 assignments
(8, '2024-09-07', '00:00:00', '2024-09-21', '23:59:00', 'Create a simple to-do list app', 'Assignment 1: To-Do List App', 5);

SET IDENTITY_INSERT ASSIGNMENT OFF;

-- Insert Submissions
SET IDENTITY_INSERT SUBMISSION ON;

INSERT INTO SUBMISSION (SubmissionID, SubmissionFile, SubmissionComments, SubmissionDescription, SubmissionScore, AssignmentID, StudentID) VALUES
-- John's submissions
(1, 'john_factorial.py', 'I tested this with several numbers', 'Factorial calculator implementation', 95.00, 1, 1),
(2, 'john_portfolio.html', 'Used flexbox for layout', 'Personal portfolio website', 88.00, 3, 1),
-- Jane's submissions
(3, 'jane_factorial.py', 'Added input validation', 'Factorial calculator with error handling', 98.00, 1, 2),
(4, 'jane_calculator.py', 'Supports basic operations', 'Simple calculator program', 92.00, 2, 2),
(5, 'jane_portfolio.html', 'Mobile-responsive design', 'Portfolio with CSS animations', 95.00, 3, 2),
-- Bob's submissions
(6, 'bob_factorial.py', 'Basic implementation', 'Factorial calculator', 85.00, 1, 3),
(7, 'bob_library_schema.sql', 'Normalized to 3NF', 'Library database schema', 90.00, 5, 3),
-- Alice's submissions
(8, 'alice_portfolio.html', 'Used Bootstrap framework', 'Professional portfolio', 93.00, 3, 4),
(9, 'alice_menu.html', 'Hamburger menu for mobile', 'Responsive navigation', 89.00, 4, 4),
-- Charlie's submissions
(10, 'charlie_library_schema.sql', 'Included ER diagram', 'Library system database', 87.00, 5, 5);

SET IDENTITY_INSERT SUBMISSION OFF;

-- Insert Edit records (teachers editing materials)
INSERT INTO EDIT (TeacherID, MaterialID, EditDate, EditTimeofDay, EditStatus) VALUES
(6, 1, '2024-08-25', '10:30:00', 'Updated'),
(6, 2, '2024-08-26', '14:15:00', 'Created'),
(6, 3, '2024-08-27', '09:00:00', 'Created'),
(7, 4, '2024-08-28', '11:00:00', 'Created'),
(7, 5, '2024-08-29', '15:30:00', 'Created'),
(7, 6, '2024-08-30', '13:45:00', 'Created'),
(8, 7, '2024-08-26', '10:00:00', 'Created'),
(8, 8, '2024-08-27', '16:20:00', 'Updated'),
(6, 9, '2024-08-28', '12:00:00', 'Created'),
(6, 10, '2024-08-29', '14:30:00', 'Created');

-- Insert Send records (submission sending)
INSERT INTO SEND (SubmissionID, UserID, SendDate, SendTime) VALUES
(1, 1, '2024-09-07', '22:30:00'),
(2, 1, '2024-09-11', '23:15:00'),
(3, 2, '2024-09-07', '20:45:00'),
(4, 2, '2024-09-16', '21:00:00'),
(5, 2, '2024-09-11', '22:00:00'),
(6, 3, '2024-09-08', '23:45:00'),
(7, 3, '2024-09-09', '19:30:00'),
(8, 4, '2024-09-12', '20:15:00'),
(9, 4, '2024-09-21', '22:45:00'),
(10, 5, '2024-09-10', '21:30:00');
