
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

router.get('/queue', ah(async (req,res)=>{
  const { cycle_id } = req.query
  const rows = await q(`
    SELECT s.id AS submission_id, u.name AS evaluated_name, i.title AS indicator_title,
           s.self_score, s.evidence_path, s.created_at
    FROM assignments a
    JOIN submissions s ON s.cycle_id=a.cycle_id AND s.user_id=a.evaluated_id
    JOIN users u ON u.id=s.user_id
    JOIN indicators i ON i.id=s.indicator_id
    LEFT JOIN reviews r ON r.submission_id=s.id AND r.reviewer_id=a.committee_id
    WHERE a.committee_id=? AND (? IS NULL OR a.cycle_id=?)
      AND r.id IS NULL
    ORDER BY s.created_at DESC
  `,[req.user.id, cycle_id||null, cycle_id||null])
  res.json({status:'success', data: rows})
}))

router.get('/assignments', ah(async (req,res)=>{
  const rows = await q(`SELECT a.*, ue.name AS evaluated_name
                        FROM assignments a
                        JOIN users ue ON ue.id=a.evaluated_id
                        WHERE a.committee_id=?
                        ORDER BY a.id DESC`, [req.user.id])
  res.json({status:'success', data: rows})
}))

router.get('/evaluation-details/:assignmentId', ah(async (req,res)=>{
  const { assignmentId } = req.params
  // ในเวิร์กช็อปนี้ตีความ assignmentId เป็น submission_id เพื่อใช้งานร่วมกับ queue/submission
  const rows = await q(`SELECT s.*, u.name AS evaluated_name, i.title AS indicator_title, i.weight AS indicator_weight, i.score_min, i.score_max
                        FROM submissions s
                        JOIN users u ON u.id=s.user_id
                        JOIN indicators i ON i.id=s.indicator_id
                        WHERE s.id=?`, [assignmentId])
  if(!rows.length) return res.status(404).json({status:'fail', message:'Not found'})
  res.json({status:'success', data: rows[0]})
}))

router.post('/submit-score', ah(async (req,res)=>{
  const { submission_id, score, comment } = req.body||{}
  await q('INSERT INTO reviews (submission_id,reviewer_id,score,comment) VALUES (?,?,?,?)',
    [submission_id, req.user.id, score, comment||null])
  res.json({status:'success', message:'Reviewed'})
}))

router.post('/add-comment', ah(async (req,res)=>{
  const { submission_id, comment } = req.body||{}
  await q('INSERT INTO reviews (submission_id,reviewer_id,score,comment) VALUES (?,?,?,?)',
    [submission_id, req.user.id, null, comment||null])
  res.json({status:'success', message:'Commented'})
}))

export default router
