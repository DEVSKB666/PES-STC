
import express from 'express'
import { openDb } from '../db.js'
import { authRequired } from '../middleware/auth.js'
const router = express.Router()
async function q(sql,p=[]) {
  const db=await openDb();
  try { const [r]=await db.query(sql,p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}
const ah = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

router.get('/me', authRequired, ah(async (req,res)=>{
  const r = await q('SELECT id,name,email,role FROM users WHERE id=?',[req.user.id])
  res.json({status:'success', data: r[0]})
}))

router.get('/indicators', authRequired, ah(async (req,res)=>{
  const rows = await q('SELECT i.*, t.name AS topic_name FROM indicators i LEFT JOIN topics t ON t.id=i.topic_id ORDER BY i.id DESC')
  res.json({status:'success', data: rows})
}))

router.get('/topics', authRequired, ah(async (req,res)=>{
  const rows = await q('SELECT * FROM topics ORDER BY id DESC')
  res.json({status:'success', data: rows})
}))

router.get('/cycles', authRequired, ah(async (req,res)=>{
  const rows = await q('SELECT * FROM cycles ORDER BY id DESC')
  res.json({status:'success', data: rows})
}))

export default router
