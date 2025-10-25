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

router.use(authRequired, allowRoles('คณะกรรมการประเมิน'))

// ลงนามอิเล็กทรอนิกส์ (ชื่อเดิม)
router.post('/sign', ah(async (req,res)=>{
  const { assignment_id, signature_data_url } = req.body
  if(!assignment_id || !signature_data_url) return res.status(400).json({status:'fail', message:'ข้อมูลไม่ครบ'})
  await q(`INSERT INTO signatures (assignment_id, reviewer_id, signed_at, signature_data)
           VALUES (?,?,NOW(),?)
           ON DUPLICATE KEY UPDATE signed_at=NOW(), signature_data=VALUES(signature_data)`, [assignment_id, req.user.id, signature_data_url])
  res.json({status:'success', message:'ลงนามแล้ว'})
}))
// ลงนามอิเล็กทรอนิกส์ (alias ตรงตามโจทย์)
router.post('/sign-evaluation', ah(async (req,res)=>{
  const { assignment_id, signature_data_url } = req.body
  if(!assignment_id || !signature_data_url) return res.status(400).json({status:'fail', message:'ข้อมูลไม่ครบ'})
  await q(`INSERT INTO signatures (assignment_id, reviewer_id, signed_at, signature_data)
           VALUES (?,?,NOW(),?)
           ON DUPLICATE KEY UPDATE signed_at=NOW(), signature_data=VALUES(signature_data)`, [assignment_id, req.user.id, signature_data_url])
  res.json({status:'success', message:'ลงนามแล้ว'})
}))

// ยกเลิกการลงนาม (ชื่อเดิม)
router.post('/unsign', ah(async (req,res)=>{
  const { assignment_id } = req.body
  await q('DELETE FROM signatures WHERE assignment_id=? AND reviewer_id=?', [assignment_id, req.user.id])
  res.json({status:'success', message:'ยกเลิกการลงนามแล้ว'})
}))
// ยกเลิกการลงนาม (alias ตรงตามโจทย์)
router.post('/unsign-evaluation', ah(async (req,res)=>{
  const { assignment_id } = req.body
  await q('DELETE FROM signatures WHERE assignment_id=? AND reviewer_id=?', [assignment_id, req.user.id])
  res.json({status:'success', message:'ยกเลิกการลงนามแล้ว'})
}))

// รายละเอียด submission + คะแนนตนเอง + ความเห็น
router.get('/submission/:id', ah(async (req,res)=>{
  const { id } = req.params
  const rows = await q(`SELECT s.id submission_id, u.name evaluated_name, i.title indicator_title, i.weight,
                               s.self_score, s.evidence_path, s.created_at
                        FROM submissions s
                        JOIN users u ON u.id=s.user_id
                        JOIN indicators i ON i.id=s.indicator_id
                        WHERE s.id=?`, [id])
  if(!rows.length) return res.status(404).json({status:'fail', message:'ไม่พบข้อมูล'})
  const comments = await q('SELECT reviewer_id, score, comment, created_at FROM reviews WHERE submission_id=? ORDER BY id', [id])
  res.json({status:'success', data:{ ...rows[0], comments }})
}))

export default router