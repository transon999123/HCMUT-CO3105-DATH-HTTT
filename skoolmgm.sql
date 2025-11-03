-- Learning Management System Database Schema for MS SQL Server
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS SEND;
DROP TABLE IF EXISTS EDIT;
DROP TABLE IF EXISTS SUBMISSION;
DROP TABLE IF EXISTS ASSIGNMENT;
DROP TABLE IF EXISTS MATERIAL;
DROP TABLE IF EXISTS ENROLL;
DROP TABLE IF EXISTS CLASS;
DROP TABLE IF EXISTS USER_PHONE;
DROP TABLE IF EXISTS STUDENT;
DROP TABLE IF EXISTS TEACHER;
DROP TABLE IF EXISTS ADMINS;
DROP TABLE IF EXISTS USERS;
-- Main USER table (parent for ADMIN, TEACHER, STUDENT)
CREATE TABLE users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    DateofBirth DATE,
    Gender VARCHAR(10),
    Email VARCHAR(255) UNIQUE NOT NULL,
    Passwords VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    MiddleName VARCHAR(100)
);

-- ADMIN table (inherits from USER)
CREATE TABLE ADMINS (
    UserID INT PRIMARY KEY,
    AdminFromDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES users (UserID) ON DELETE CASCADE
);

-- TEACHER table (inherits from USER)
CREATE TABLE TEACHER (
    UserID INT PRIMARY KEY,
    Experience INT,
    TeacherFromDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES users (UserID) ON DELETE CASCADE
);

-- STUDENT table (inherits from USER)
CREATE TABLE STUDENT (
    UserID INT PRIMARY KEY,
    FOREIGN KEY (UserID) REFERENCES  users (UserID) ON DELETE CASCADE
);

-- USER_PHONE table (one-to-many relationship with USER)
CREATE TABLE USER_PHONE (
    UserID INT,
    PhoneNumber VARCHAR(20),
    PRIMARY KEY (UserID, PhoneNumber),
    FOREIGN KEY (UserID) REFERENCES users (UserID) ON DELETE CASCADE
);

-- CLASS table
CREATE TABLE CLASS (
    ClassID INT PRIMARY KEY IDENTITY(1,1),
    ClassName VARCHAR(255) NOT NULL,
    ClassDescription NVARCHAR(MAX),
    DaysofWeek VARCHAR(50),
    ClassStartTime TIME,
    ClassEndTime TIME,
    AdminCreate INT,
    Teacher INT,
    FOREIGN KEY (AdminCreate) REFERENCES ADMINS(UserID),
    FOREIGN KEY (Teacher) REFERENCES TEACHER(UserID)
);

-- ENROLL table (many-to-many relationship between STUDENT and CLASS)
CREATE TABLE ENROLL (
    EnrollID INT PRIMARY KEY IDENTITY(1,1),
    StudentID INT NOT NULL,
    ClassID INT NOT NULL,
    state_of_enroll VARCHAR(50),
    FOREIGN KEY (StudentID) REFERENCES STUDENT(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ClassID) REFERENCES CLASS(ClassID) ON DELETE CASCADE,
    UNIQUE (StudentID, ClassID)
);

-- MATERIAL table
CREATE TABLE MATERIAL (
    MaterialID INT PRIMARY KEY IDENTITY(1,1),
    MaterialURL VARCHAR(500),
    MaterialType VARCHAR(50),
    MaterialTitle VARCHAR(255) NOT NULL,
    ClassID INT,
    FOREIGN KEY (ClassID) REFERENCES CLASS(ClassID) ON DELETE CASCADE
);

-- ASSIGNMENT table
CREATE TABLE ASSIGNMENT (
    AssignmentID INT PRIMARY KEY IDENTITY(1,1),
    AssignmentStartDate DATE,
    AssignmentStartTime TIME,
    AssignmentEndDate DATE,
    AssignmentEndTime TIME,
    AssignmentDescription NVARCHAR(MAX),
    AssignmentName VARCHAR(255) NOT NULL,
    ClassID INT,
    FOREIGN KEY (ClassID) REFERENCES CLASS(ClassID) ON DELETE CASCADE
);

-- SUBMISSION table
CREATE TABLE SUBMISSION (
    SubmissionID INT PRIMARY KEY IDENTITY(1,1),
    SubmissionFile VARCHAR(500),
    SubmissionComments NVARCHAR(MAX),
    SubmissionDescription NVARCHAR(MAX),
    SubmissionScore DECIMAL(5,2),
    AssignmentID INT,
    StudentID INT,
    FOREIGN KEY (AssignmentID) REFERENCES ASSIGNMENT(AssignmentID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES STUDENT(UserID)
);

-- EDIT table (tracks edits to materials by teachers)
CREATE TABLE EDIT (
    EditID INT PRIMARY KEY IDENTITY(1,1),
    TeacherID INT NOT NULL,
    MaterialID INT NOT NULL,
    EditDate DATE,
    EditTimeofDay TIME,
    EditStatus VARCHAR(50),
    FOREIGN KEY (TeacherID) REFERENCES TEACHER(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MaterialID) REFERENCES MATERIAL(MaterialID) ON DELETE CASCADE,
    UNIQUE (TeacherID, MaterialID, EditID)
);

-- SEND table (tracks when submissions are sent)
CREATE TABLE SEND (
    SubmissionID INT,
    UserID INT,
    SendDate DATE,
    SendTime TIME,
    PRIMARY KEY (SubmissionID, UserID),
    FOREIGN KEY (SubmissionID) REFERENCES SUBMISSION(SubmissionID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES users (UserID)
);

-- Indexes for better query performance
CREATE INDEX idx_user_email ON users(Email);
CREATE INDEX idx_class_teacher ON CLASS(Teacher);
CREATE INDEX idx_enroll_student ON ENROLL(StudentID);
CREATE INDEX idx_enroll_class ON ENROLL(ClassID);
CREATE INDEX idx_assignment_class ON ASSIGNMENT(ClassID);
CREATE INDEX idx_submission_assignment ON SUBMISSION(AssignmentID);
CREATE INDEX idx_submission_student ON SUBMISSION(StudentID);