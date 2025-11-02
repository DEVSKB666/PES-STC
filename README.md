# PES+ Full Demo — ระบบประเมินผลงานบุคลากร

โครงการตัวอย่างสำหรับระบบประเมินผลงาน ประกอบด้วยฝั่ง API (`server/`) และฝั่งเว็บ (`web/`). มีฟังก์ชันส่งออก PDF พร้อมรองรับภาษาไทยด้วยฟอนต์ที่ฝังในรายงาน

## โครงสร้างโปรเจกต์
- `server/` — Node.js + Express API, มี routing สำหรับการล็อกอิน/ข้อมูล/รายงาน และการส่งออก PDF
- `server/fonts/` — ฟอนต์ภาษาไทยสำหรับฝังใน PDF เช่น `NotoSansThai-Regular.ttf`
- `server/routes/reports.js` — โค้ดสร้างรายงาน PDF พร้อมเลย์เอาต์แบบตารางและรองรับฟอนต์ไทย
- `web/` — Frontend Vue 3 + Vite + Tailwind, มีหน้าใช้งานสำหรับผู้ประเมิน/HR/คณะกรรมการ
- `personnel_eval.sql` — ไฟล์ schema ฐานข้อมูลสำหรับนำเข้าไปยัง MySQL
- `.gitignore` — กำหนดไฟล์/โฟลเดอร์ที่ไม่ควรถูก commit เช่น `node_modules/`, `uploads/`, `.env` ฯลฯ

## ข้อกำหนดระบบ
- `Node.js` เวอร์ชัน 18 ขึ้นไป
- `npm` หรือ `pnpm`
- ฐานข้อมูล `MySQL` (หรือ MariaDB) พร้อมสิทธิ์เข้าถึง
- `Git` (สำหรับ clone/push โค้ด)

## การติดตั้งและตั้งค่า
1. ติดตั้ง dependencies (ทำแยกสองฝั่ง)
   - ฝั่ง API
     - เข้าไปที่ `server/`
     - รันคำสั่ง: `npm install`
   - ฝั่งเว็บ
     - เข้าไปที่ `web/`
     - รันคำสั่ง: `npm install`

2. ตั้งค่า Environment ของ API
   - สร้างไฟล์ `server/.env` โดยดูตัวอย่างจาก `server/.env.example`
   - ตัวแปรที่ควรมี (ตัวอย่าง):
     - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
     - `JWT_SECRET` — secret สำหรับ token
     - `PORT` — พอร์ตของ API (เช่น `3001`)

3. เตรียมฐานข้อมูล
   - นำเข้าไฟล์ `personnel_eval.sql` ลงในฐานข้อมูล MySQL ของคุณ
   - ตรวจสอบสิทธิ์ผู้ใช้งานและค่าคอนฟิกให้สอดคล้องกับ `.env`

4. ฟอนต์ภาษาไทยสำหรับ PDF
   - มีไฟล์ `server/fonts/NotoSansThai-Regular.ttf` รวมในโปรเจกต์แล้ว
   - หากต้องการเปลี่ยน/เพิ่มฟอนต์ ให้ใส่ไฟล์ `.ttf` ในโฟลเดอร์ `server/fonts/`
   - หมายเหตุ: ต้องเป็นไฟล์ `.ttf` แท้ ไม่ใช่ไฟล์ `.ttc` หรือไฟล์ที่ดาวน์โหลดมาเป็นหน้า HTML

## การรันโปรเจกต์
- รัน API Server
  - `cd server`
  - `npm run dev` (สำหรับโหมดพัฒนา) หรือ `npm start`
- รันเว็บ (Vite dev server)
  - `cd web`
  - `npm run dev`
- เปิดเว็บผ่านเบราว์เซอร์ (ค่าเริ่มต้น Vite คือ `http://localhost:5173/`) และตรวจสอบการเชื่อมต่อกับ API ตามพอร์ตที่ตั้งไว้ใน `.env`

## การใช้งานส่งออก PDF
- ผ่านหน้าเว็บ: ไปที่หน้า Report แล้วกดปุ่ม Export เพื่อดาวน์โหลดไฟล์ PDF
- โครงสร้างตารางใน PDF: หัวข้อ (Topic), ตัวชี้วัด (Indicator), น้ำหนัก (Weight), คะแนน Self, คะแนน Committee พร้อมตัดคำและขึ้นหน้าอัตโนมัติ
- รองรับภาษาไทยโดยฝังฟอนต์จาก `server/fonts/` หากไม่พบฟอนต์ จะ fallback เป็น `Helvetica`

## ทิป & การแก้ปัญหา
- ตัวอักษรไทยเป็น `?` หรืออ่านไม่ออก
  - ตรวจสอบว่ามีไฟล์ `.ttf` ไทยใน `server/fonts/` เช่น `NotoSansThai-Regular.ttf`
  - รีสตาร์ต API แล้วลองส่งออกใหม่
- Error: `Unknown font format`
  - ตรวจสอบว่าไฟล์เป็น `.ttf` จริง (ไม่ใช่ `.ttc` หรือไฟล์ดาวน์โหลดผิดเป็น HTML)
  - ลองดาวน์โหลดฟอนต์ใหม่จาก Google Fonts แล้ววางใน `server/fonts/`
- Error: `Cannot set headers after they are sent`
  - โค้ดได้ปรับให้เลือกฟอนต์ก่อน `doc.pipe(res)` แล้ว หากยังพบ ให้ตรวจสอบ log ของ API และรีสตาร์ตบริการ

## โครงสร้าง API เบื้องต้น
- การยืนยันตัวตน: ใช้ middleware `authRequired` ตรวจสอบ token และสิทธิ์
- Export รายงาน: เส้นทางใน `server/routes/reports.js` ใช้การสร้าง PDF ด้วย `PDFKit` และจัดการฟอนต์ไทย

## การเตรียมโค้ดสำหรับเครื่องอื่น / Deploy
1. ตั้งค่า `.env` ในเครื่องปลายทางตาม `server/.env.example`
2. นำเข้า `personnel_eval.sql` ไปยังฐานข้อมูล
3. ตรวจสอบให้มีฟอนต์ภาษาไทยใน `server/fonts/`
4. ติดตั้ง dependencies และรันบริการตามขั้นตอนด้านบน

## การ Push ขึ้น Git
- สร้าง repository เปล่าบน GitHub/GitLab แล้วคัดลอก URL
- ตั้งค่า remote และ push ครั้งแรก:
  - `git remote add origin <URL-ของ-repo>`
  - `git push -u origin main`

## หมายเหตุ
- ไฟล์ที่ไม่ถูก commit: `node_modules/`, `.env`, `uploads/`, `dist/`, `.DS_Store`, `*.log` ตามที่กำหนดใน `.gitignore`
- หากมีการแก้ไขเส้นทางหรือพอร์ตของ API โปรดตรวจสอบการตั้งค่าในฝั่งเว็บให้สอดคล้องกัน