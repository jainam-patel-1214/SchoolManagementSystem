-- 001.sql
CREATE TABLE IF NOT EXISTS students (
    grNo int PRIMARY KEY,
    sPwd varchar(8) NOT NULL,
    userRole varchar(10) DEFAULT 'student',
    studName VARCHAR(50) NOT NULL,
    std int NOT NULL,
    section VARCHAR(2) NOT NULL,
    CONSTRAINT check_std_input CHECK (std BETWEEN 1 AND 12)
);
CREATE TABLE IF NOT EXISTS teachers (
    tId VARCHAR(8) PRIMARY KEY,
    tPwd varchar(8) NOT NULL,
    userRole varchar(10) DEFAULT 'teacher',
    tName VARCHAR(50) NOT NULL,
    subId int,
    stdAllocated int,
    sectionAllocated VARCHAR(2)
);
CREATE TABLE IF NOT EXISTS subjects (
    subId int PRIMARY KEY,
    subName VARCHAR(50) NOT NULL,
    levelStd int NOT NULL,
    credits int NOT NULL,
    CONSTRAINT check_level_input CHECK (levelStd BETWEEN 1 AND 12)
);

CREATE TABLE IF NOT EXISTS marks (
    grNo int NOT NULL,
    subId int NOT NULL, 
    theoryM int,
    practicalM int, 
    grade varchar(2), 
    FOREIGN KEY (grNo) REFERENCES students(grNo) ON DELETE CASCADE, 
    FOREIGN KEY (subId) REFERENCES subjects(subId) ON DELETE CASCADE,
    CONSTRAINT check_theory_marks_input CHECK (theoryM BETWEEN 0 AND 80),
    CONSTRAINT check_practical_marks_input CHECK (practicalM BETWEEN 0 AND 20)
);
CREATE TABLE IF NOT EXISTS subjectAllocation (
    std int NOT NULL,
    subject_limit int NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
    tId VARCHAR(8) NOT NULL,
    grNo int NOT NULL,
    comment VARCHAR(255),
    FOREIGN KEY (tId) REFERENCES teachers(tId) ON DELETE CASCADE,
    FOREIGN KEY (grNo) REFERENCES students(grNo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activeSessions(
    sessionId int NOT NULL AUTO_INCREMENT,
    sessiontoken TEXT NOT NULL,
    userRole VARCHAR(10) NOT NULL,
    validtime DATETIME NOT NULL,
    PRIMARY KEY(sessionId)
);
CREATE TABLE IF NOT EXISTS pendingApplications(
    id int NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    role_requested VARCHAR(10) NOT NULL,
    user_pwd VARCHAR(8) NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS admins(
    admin_id VARCHAR(10) NOT NULL PRIMARY KEY,
    admin_name VARCHAR(20) NOT NULL,
    admin_pwd VARCHAR(8) NOT NULL
)