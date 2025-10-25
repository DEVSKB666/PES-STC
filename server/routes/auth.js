
import express from 'express'
import { openDb } from '../db.js'
import { signToken, authRequired } from '../middleware/auth.js'
import bcryptjs from 'bcryptjs'
const router = express.Router()
async function q(sql,p=[]) {
  const db=await openDb();
  try { const [r]=await db.query(sql,p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}

router.post('/login', async (req,res)=>{
  const { email, password } = req.body||{}
  const rows = await q('SELECT * FROM users WHERE email=?',[email])
  if(!rows.length) return res.status(401).json({status:'fail',message:'อีเมลหรือรหัสผ่านไม่ถูกต้อง'})
  const ok = await bcryptjs.compare(String(password||''), rows[0].password_hash)
  if(!ok) return res.status(401).json({status:'fail',message:'อีเมลหรือรหัสผ่านไม่ถูกต้อง'})
  res.json({status:'success', data:{ token: signToken(rows[0]), user:{ id:rows[0].id, name:rows[0].name, email:rows[0].email, role:rows[0].role }}})
})

router.post('/register', async (req,res)=>{
  const { name, email, password, role } = req.body||{}
  if(!name||!email||!password||!role) return res.status(400).json({status:'fail',message:'ข้อมูลไม่ครบ'})
  const exists = await q('SELECT id FROM users WHERE email=?',[email])
  if(exists.length) return res.status(400).json({status:'fail',message:'อีเมลนี้มีอยู่แล้ว'})
  const hash = await bcryptjs.hash(String(password), 10)
  await q('INSERT INTO users (name,email,role,password_hash) VALUES (?,?,?,?)',[name,email,role,hash])
  res.json({status:'success', message:'สมัครสมาชิกสำเร็จ'})
})

// DEMO reset password (by email). Do NOT use this in production.
router.post('/reset', async (req,res)=>{
  const { email, new_password } = req.body||{}
  if(!email||!new_password) return res.status(400).json({status:'fail',message:'ข้อมูลไม่ครบ'})
  const hash = await bcryptjs.hash(String(new_password), 10)
  const r = await q('UPDATE users SET password_hash=? WHERE email=?',[hash,email])
  if(!r.affectedRows) return res.status(404).json({status:'fail',message:'ไม่พบอีเมลนี้'})
  res.json({status:'success', message:'รีเซ็ตรหัสผ่านเรียบร้อย'})
})

router.get('/me', authRequired, async (req,res)=>{
  const db = await openDb();
  const [rows] = await db.query('SELECT id,name,email,role FROM users WHERE id=?',[req.user.id])
  // release db
  try { db.end && db.end() } catch(_) {}
  res.json({status:'success', data: rows[0]})
})

router.post('/seed', async (req,res)=>{
  try {
    const users = [
      {name:'Admin', email:'admin', role:'ฝ่ายบริหารบุคลากร', password:'password123'},
      {name:'Teacher 1', email:'teacher1', role:'ผู้รับการประเมิน', password:'password123'},
      {name:'Teacher 2', email:'teacher2', role:'ผู้รับการประเมิน', password:'password123'},
      {name:'Evaluator 1', email:'evaluator1', role:'คณะกรรมการประเมิน', password:'password123'},
      {name:'Evaluator 2', email:'evaluator2', role:'คณะกรรมการประเมิน', password:'password123'},
    ];
    const db = await openDb();
    for (const u of users) {
      const [exists] = await db.query('SELECT id FROM users WHERE email=?',[u.email])
      if (!exists.length) {
        const hash = await bcryptjs.hash(String(u.password), 10)
        await db.query('INSERT INTO users (name,email,role,password_hash) VALUES (?,?,?,?)',[u.name,u.email,u.role,hash])
      }
    }
    try { db.end && db.end() } catch(_) {}
    res.json({status:'success', message:'seeded'})
  } catch(e) {
    res.status(500).json({status:'error', message:String(e)})
  }
})

export default router
