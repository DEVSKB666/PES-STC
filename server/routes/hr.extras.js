import express from 'express'
import { openDb } from '../db.js'
import { authRequired, allowRoles } from '../middleware/auth.js'
const router = express.Router()
async function q(sql,p=[]) {
  const db=await openDb();
  try { const [r]=await db.query(sql,p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}
const ah = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

router.use(authRequired, allowRoles('ฝ่ายบริหารบุคลากร'))

// จัดการรอบประเมิน
router.get('/periods', ah(async (req,res)=>{
  const rows = await q('SELECT * FROM cycles ORDER BY id DESC')
  res.json({status:'success', data: rows})
}))
router.post('/periods', ah(async (req,res)=>{
  const { name, start_date, end_date, is_open } = req.body||{}
  await q('INSERT INTO cycles (name,start_date,end_date,is_open) VALUES (?,?,?,?)',[name, start_date, end_date, is_open?1:0])
  res.json({status:'success', message:'สร้างช่วงเวลาแล้ว'})
}))

router.patch('/cycles/:id/status', ah(async (req,res)=>{
  const { id } = req.params
  const { is_open } = req.body
  await q('UPDATE cycles SET is_open=? WHERE id=?', [is_open?1:0, id])
  res.json({status:'success', message:'อัปเดตสถานะรอบประเมินแล้ว'})
}))

// สถิติภาพรวม
router.get('/statistics', ah(async (req,res)=>{
  const [[counts]] = await Promise.all([
    q('SELECT (SELECT COUNT(*) FROM users WHERE role="ผู้รับการประเมิน") teachers, (SELECT COUNT(*) FROM users WHERE role="คณะกรรมการประเมิน") evaluators, (SELECT COUNT(*) FROM cycles) cycles')
  ])
  res.json({status:'success', data: counts})
}))

export default router