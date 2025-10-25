
-- PES Plus – ระบบประเมินบุคลากร 68-70 (Demo)
-- Reset DB
DROP DATABASE IF EXISTS personnel_eval;
CREATE DATABASE personnel_eval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personnel_eval;

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  name VARCHAR(191) NOT NULL,
  role ENUM('ฝ่ายบริหารบุคลากร','ผู้รับการประเมิน','คณะกรรมการประเมิน') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Topics / Indicators
CREATE TABLE topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  weight DECIMAL(6,2) NOT NULL,
  score_min INT NOT NULL DEFAULT 1,
  score_max INT NOT NULL DEFAULT 4,
  evidence_type ENUM('none','pdf','url','pdf_or_url') NOT NULL DEFAULT 'pdf_or_url',
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cycles with windows
CREATE TABLE cycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  submit_start DATETIME NULL,
  submit_end   DATETIME NULL,
  review_start DATETIME NULL,
  review_end   DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assignments
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cycle_id INT NOT NULL,
  evaluated_id INT NOT NULL,
  committee_id INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
  reeval_requested TINYINT(1) NOT NULL DEFAULT 0,
  reeval_reason TEXT NULL,
  reeval_approved TINYINT(1) NULL,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluated_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (committee_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assign_cycle (cycle_id),
  INDEX idx_assign_eval (evaluated_id),
  INDEX idx_assign_comm (committee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Submissions
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cycle_id INT NOT NULL,
  user_id INT NOT NULL,
  indicator_id INT NOT NULL,
  self_score INT NOT NULL,
  evidence_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
  INDEX idx_sub (cycle_id, user_id, indicator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  score INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_review (submission_id, reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Signatures
CREATE TABLE committee_signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  signed_at DATETIME NULL,
  signature_data TEXT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_sign (assignment_id, reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed users (password = 123456)
SET @hash := '$2a$10$ZLvnRZK5x1IY0MN7iQhxuOCa/k2E9hVRybWW6PQfAQ3eL7ONkU3Dq';
INSERT INTO users (email,name,role,password_hash) VALUES
('hr@demo.local','ผู้ดูแลระบบ','ฝ่ายบริหารบุคลากร',@hash),
('com1@demo.local','คณะกรรมการ A','คณะกรรมการประเมิน',@hash),
('com2@demo.local','คณะกรรมการ B','คณะกรรมการประเมิน',@hash),
('com3@demo.local','คณะกรรมการ C','คณะกรรมการประเมิน',@hash),
('eva1@demo.local','ผู้รับการประเมิน 1','ผู้รับการประเมิน',@hash),
('eva2@demo.local','ผู้รับการประเมิน 2','ผู้รับการประเมิน',@hash),
('eva3@demo.local','ผู้รับการประเมิน 3','ผู้รับการประเมิน',@hash),
('eva4@demo.local','ผู้รับการประเมิน 4','ผู้รับการประเมิน',@hash),
('eva5@demo.local','ผู้รับการประเมิน 5','ผู้รับการประเมิน',@hash);

-- Topics & Indicators
INSERT INTO topics (name,description) VALUES
('สมรรถนะหลัก','หัวข้อหลักขององค์กร'),
('สมรรถนะเฉพาะงาน','หัวข้อเฉพาะสายงาน');

INSERT INTO indicators (topic_id,title,description,weight,score_min,score_max,evidence_type) VALUES
((SELECT id FROM topics WHERE name='สมรรถนะหลัก'),'ความตรงต่อเวลา','ตามเวลาที่กำหนด',20,1,4,'pdf_or_url'),
((SELECT id FROM topics WHERE name='สมรรถนะหลัก'),'คุณภาพงาน','ความถูกต้อง ครบถ้วน',30,1,4,'pdf_or_url'),
((SELECT id FROM topics WHERE name='สมรรถนะหลัก'),'ความรับผิดชอบ','งานที่รับผิดชอบ',25,1,4,'pdf_or_url'),
((SELECT id FROM topics WHERE name='สมรรถนะเฉพาะงาน'),'การบริการ/สื่อสาร','สื่อสารกับผู้เกี่ยวข้อง',15,1,4,'url'),
((SELECT id FROM topics WHERE name='สมรรถนะเฉพาะงาน'),'การทำงานเป็นทีม','ร่วมมือกับทีม',10,1,4,'pdf');

-- Cycle
INSERT INTO cycles (name,start_date,end_date,submit_start,submit_end,review_start,review_end,is_active) VALUES
('ภาคเรียน 1/2568','2025-06-01','2025-10-31','2025-06-01 00:00:00','2025-09-30 23:59:59','2025-07-01 00:00:00','2025-10-31 23:59:59',1);
SET @c1 := LAST_INSERT_ID();

-- Assignments
SET @eva1 := (SELECT id FROM users WHERE email='eva1@demo.local');
SET @eva2 := (SELECT id FROM users WHERE email='eva2@demo.local');
SET @eva3 := (SELECT id FROM users WHERE email='eva3@demo.local');
SET @eva4 := (SELECT id FROM users WHERE email='eva4@demo.local');
SET @eva5 := (SELECT id FROM users WHERE email='eva5@demo.local');
SET @com1 := (SELECT id FROM users WHERE email='com1@demo.local');
SET @com2 := (SELECT id FROM users WHERE email='com2@demo.local');
SET @com3 := (SELECT id FROM users WHERE email='com3@demo.local');

INSERT INTO assignments (cycle_id, evaluated_id, committee_id, status) VALUES
(@c1,@eva1,@com1,'ASSIGNED'),
(@c1,@eva2,@com2,'ASSIGNED'),
(@c1,@eva3,@com3,'ASSIGNED'),
(@c1,@eva4,@com1,'ASSIGNED'),
(@c1,@eva5,@com2,'ASSIGNED');

-- Sample submissions + reviews
SET @ind1 := (SELECT id FROM indicators WHERE title='ความตรงต่อเวลา');
SET @ind2 := (SELECT id FROM indicators WHERE title='คุณภาพงาน');
SET @ind3 := (SELECT id FROM indicators WHERE title='ความรับผิดชอบ');
SET @ind4 := (SELECT id FROM indicators WHERE title='การบริการ/สื่อสาร');
SET @ind5 := (SELECT id FROM indicators WHERE title='การทำงานเป็นทีม');

INSERT INTO submissions (cycle_id,user_id,indicator_id,self_score,evidence_path,created_at) VALUES
(@c1,@eva1,@ind1,3,'uploads/eva1_punctuality.pdf','2025-07-01 10:00:00'),
(@c1,@eva1,@ind2,3,'uploads/eva1_quality.pdf','2025-07-01 10:05:00'),
(@c1,@eva1,@ind3,4,NULL,'2025-07-01 10:10:00'),
(@c1,@eva1,@ind4,3,NULL,'2025-07-01 10:15:00'),
(@c1,@eva1,@ind5,4,'uploads/eva1_team.jpg','2025-07-01 10:20:00');

INSERT INTO reviews (submission_id,reviewer_id,score,comment,created_at) VALUES
((SELECT id FROM submissions WHERE user_id=@eva1 AND indicator_id=@ind1),@com1,4,'มาตรงเวลา','2025-07-05 09:00:00'),
((SELECT id FROM submissions WHERE user_id=@eva1 AND indicator_id=@ind2),@com1,3,'คุณภาพใช้ได้','2025-07-05 09:02:00'),
((SELECT id FROM submissions WHERE user_id=@eva1 AND indicator_id=@ind3),@com1,4,'รับผิดชอบดี','2025-07-05 09:04:00'),
((SELECT id FROM submissions WHERE user_id=@eva1 AND indicator_id=@ind4),@com1,3,'สื่อสารกลางๆ','2025-07-05 09:06:00'),
((SELECT id FROM submissions WHERE user_id=@eva1 AND indicator_id=@ind5),@com1,4,'ทีมเวิร์คดี','2025-07-05 09:08:00');
