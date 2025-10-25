
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

router.post('/topics', ah(async (req,res)=>{
  const { name, description } = req.body||{}
  await q('INSERT INTO topics (name,description) VALUES (?,?)',[name,description||null])
  res.json({status:'success', message:'Created'})
}))

// ลบหัวข้อการประเมิน
router.delete('/topics/:id', ah(async (req,res)=>{
  const { id } = req.params
  const r = await q('DELETE FROM topics WHERE id=?',[id])
  if (!r?.affectedRows) return res.status(404).json({status:'fail', message:'ไม่พบหัวข้อ'})
  res.json({status:'success', message:'ลบหัวข้อแล้ว'})
}))

router.post('/indicators', ah(async (req,res)=>{
  const { topic_id, title, description, weight, score_min, score_max, evidence_type } = req.body||{}
  await q('INSERT INTO indicators (topic_id,title,description,weight,score_min,score_max,evidence_type) VALUES (?,?,?,?,?,?,?)',
    [topic_id||null,title,description||null,weight,score_min||1,score_max||4,evidence_type||'pdf_or_url'])
  res.json({status:'success', message:'Created'})
}))

router.post('/cycles', ah(async (req,res)=>{
  const { name, start_date, end_date, submit_start, submit_end, review_start, review_end, is_active } = req.body||{}
  await q('INSERT INTO cycles (name,start_date,end_date,submit_start,submit_end,review_start,review_end,is_active) VALUES (?,?,?,?,?,?,?,?)',
    [name,start_date,end_date,submit_start||null,submit_end||null,review_start||null,review_end||null,is_active?1:0])
  res.json({status:'success', message:'Created'})
}))

router.get('/assignments', ah(async (req,res)=>{
  const { cycle_id } = req.query
  const rows = await q(`SELECT a.*, ue.name AS evaluated_name, uc.name AS committee_name,
                               (SELECT COUNT(*) FROM submissions s
                                JOIN reviews r ON r.submission_id=s.id
                                WHERE s.cycle_id=a.cycle_id AND s.user_id=a.evaluated_id AND r.reviewer_id=a.committee_id) AS review_count
                        FROM assignments a
                        JOIN users ue ON ue.id=a.evaluated_id
                        JOIN users uc ON uc.id=a.committee_id
                        WHERE (? IS NULL OR a.cycle_id=?)
                        ORDER BY a.id DESC`, [cycle_id||null, cycle_id||null])
  res.json({status:'success', data: rows})
}))

router.post('/assignments', ah(async (req,res)=>{
  const { cycle_id, evaluated_id, committee_id } = req.body||{}
  await q('INSERT INTO assignments (cycle_id,evaluated_id,committee_id,status) VALUES (?,?,?,?)',[cycle_id,evaluated_id,committee_id,'ASSIGNED'])
  res.json({status:'success', message:'Assigned'})
}))

router.get('/stats/overview', ah(async (req,res)=>{
  const { cycle_id } = req.query
  const rows = await q(`
    SELECT u.id AS user_id, u.name,
           AVG(COALESCE(r.score,s.self_score)) AS avg_score,
           MIN(COALESCE(r.score,s.self_score)) AS min_score,
           MAX(COALESCE(r.score,s.self_score)) AS max_score,
           ROUND(SUM(COALESCE(r.score,s.self_score)*(i.weight/100)),2) AS total_weighted
    FROM submissions s
    JOIN users u ON u.id=s.user_id
    JOIN indicators i ON i.id=s.indicator_id
    LEFT JOIN reviews r ON r.submission_id=s.id
    WHERE s.cycle_id=?
    GROUP BY u.id,u.name
    ORDER BY total_weighted DESC
  `,[cycle_id])
  res.json({status:'success', data: rows})
}))

router.get('/users', ah(async (req,res)=>{
  const rows = await q('SELECT id,name,email,role FROM users ORDER BY id DESC')
  res.json({status:'success', data: rows})
}))

router.get('/indicators/:topicId', ah(async (req,res)=>{
  const { topicId } = req.params
  const rows = await q('SELECT * FROM indicators WHERE topic_id=? ORDER BY id DESC',[topicId])
  res.json({status:'success', data: rows})
}))

router.get('/topics/:periodId', ah(async (req,res)=>{
  // โครงสร้างเดิมไม่ได้ผูก topic กับ period โดยตรง จึงคืนทั้งหมด
  const rows = await q('SELECT * FROM topics ORDER BY id DESC')
  res.json({status:'success', data: rows})
}))

export default router
