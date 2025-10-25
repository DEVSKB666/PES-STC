import express from 'express';
import { openDb } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = express.Router();
async function q(sql, p = []) {
  const db = await openDb();
  try { const [r] = await db.query(sql, p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}
const ah = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

router.use(authRequired, allowRoles('ผู้รับการประเมิน'));

// อัปโหลดไฟล์หลักฐาน (ใช้ express-fileupload)
router.post('/upload', ah(async (req, res) => {
  const file = req.files?.file;
  if (!file)
    return res.status(400).json({ status: 'fail', message: 'ไม่มีไฟล์' });
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allow = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
  if (!allow.includes(ext))
    return res
      .status(400)
      .json({ status: 'fail', message: 'ชนิดไฟล์ไม่ถูกต้อง' });
  const fname = Date.now() + '_' + file.name.replace(/\s+/g, '_');
  const dir = process.env.UPLOAD_DIR || 'uploads';
  await file.mv(`${dir}/${fname}`);
  res.json({ status: 'success', data: { path: `/uploads/${fname}` } });
}))

// ดูความเห็นจากกรรมการของฉัน ในรอบประเมิน
router.get('/comments', ah(async (req, res) => {
  const { cycle_id } = req.query;
  const rows = await q(
    `
    SELECT s.id submission_id, i.title indicator_title, r.score, r.comment, r.created_at
    FROM submissions s
    JOIN indicators i ON i.id=s.indicator_id
    JOIN reviews r ON r.submission_id=s.id
    WHERE s.cycle_id=? AND s.user_id=?
    ORDER BY r.created_at DESC
  `,
    [cycle_id, req.user.id]
  );
  res.json({ status: 'success', data: rows });
}))

// เพิ่มท้ายไฟล์ server/routes/evaluated.extras.js

// บันทึก/อัปเดตการประเมินตนเอง (รองรับ payload แบบกลุ่ม)
router.post('/self-evaluation', ah(async (req, res) => {
  try {
    const { cycle_id, items } = req.body || {};
    if (!cycle_id || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'ข้อมูลไม่ครบ (cycle_id, items[])' });
    }

    await q('DELETE FROM submissions WHERE user_id=? AND cycle_id=?', [
      req.user.id,
      cycle_id,
    ]);

    for (const it of items) {
      const {
        indicator_id,
        score,
        evidence_type,
        evidence_value,
        comment,
        draft,
      } = it;

      const self_score = typeof score === 'number' ? score : null;

      await q(
        `
        INSERT INTO submissions
          (user_id, cycle_id, indicator_id, self_score, evidence_type, evidence_value, comment, created_at)
        VALUES
          (?,?,?,?,?,?,?, NOW())
      `,
        [
          req.user.id,
          cycle_id,
          indicator_id,
          self_score,
          evidence_type || null,
          evidence_value || null,
          comment || null,
        ]
      );
    }

    return res.json({ status: 'success', data: { saved: items.length } });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ status: 'error', message: 'บันทึกการประเมินตนเองไม่สำเร็จ' });
  }
}))

// รายการผลงานที่ส่งของฉัน พร้อมสถานะว่าถูกประเมินแล้วหรือยัง
router.get('/submissions', ah(async (req, res) => {
  const { cycle_id } = req.query;
  const rows = await q(`
    SELECT s.id, s.cycle_id, s.indicator_id,
           i.title AS indicator_title, i.weight,
           t.name AS topic_name,
           s.self_score, s.evidence_path, s.created_at,
           CASE WHEN EXISTS(SELECT 1 FROM reviews r WHERE r.submission_id=s.id)
                THEN 'reviewed' ELSE 'pending' END AS status
    FROM submissions s
    JOIN indicators i ON i.id=s.indicator_id
    LEFT JOIN topics t ON t.id=i.topic_id
    WHERE s.user_id=? AND (? IS NULL OR s.cycle_id=?)
    ORDER BY s.created_at DESC
  `, [req.user.id, cycle_id || null, cycle_id || null]);
  res.json({ status: 'success', data: rows });
}));

// ลบผลงานที่ส่ง ถ้ายังไม่ถูกประเมิน
router.delete('/submissions/:id', ah(async (req, res) => {
  const { id } = req.params;
  const [rev] = await q('SELECT COUNT(*) AS c FROM reviews WHERE submission_id=?', [id]);
  if ((rev?.c ?? 0) > 0) {
    return res.status(400).json({ status: 'fail', message: 'รายการนี้ถูกประเมินแล้ว ลบไม่ได้' });
  }
  const r = await q('DELETE FROM submissions WHERE id=? AND user_id=?', [id, req.user.id]);
  if (!r?.affectedRows) {
    return res.status(404).json({ status: 'fail', message: 'ไม่พบรายการของคุณ' });
  }
  res.json({ status: 'success', message: 'ลบผลงานแล้ว' });
}));

export default router;
