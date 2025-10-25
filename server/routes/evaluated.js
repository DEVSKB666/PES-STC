import express from 'express';
import { openDb } from '../db.js';
import { authRequired, allowRoles } from '../middleware/auth.js';
const router = express.Router();

// helper: simple query
async function q(sql, p = []) {
  const db = await openDb();
  try { const [r] = await db.query(sql, p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}
const ah = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

router.use(authRequired, allowRoles('ผู้รับการประเมิน'));

// backward-compatible single-submit (existing)
router.post('/submit', ah(async (req, res) => {
  const { cycle_id, indicator_id, self_score, evidence_url } = req.body;
  if (!cycle_id || !indicator_id) {
    return res
      .status(400)
      .json({
        status: 'fail',
        message: 'ข้อมูลไม่ครบ (cycle_id, indicator_id)',
      });
  }
  try {
    await q(
      'INSERT INTO submissions (cycle_id,user_id,indicator_id,self_score,evidence_path) VALUES (?,?,?,?,?)',
      [
        cycle_id,
        req.user.id,
        indicator_id,
        self_score ?? null,
        evidence_url ?? null,
      ]
    );
    return res.json({ status: 'success', message: 'Submitted' });
  } catch (err) {
    console.error('submit error', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'บันทึกการประเมินตนเองไม่สำเร็จ' });
  }
}))

/*
  New endpoint expected by frontend:
  POST /api/evaluated/self-evaluation
  body: { cycle_id: number, items: [ { indicator_id, score? , evidence_url?, text? } ], status?: 'draft'|'submitted' }
*/
router.post('/self-evaluation', ah(async (req, res) => {
  const { cycle_id, items, status } = req.body;
  if (!cycle_id || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'ข้อมูลไม่ครบ (cycle_id, items[])' });
  }

  try {
    let inserted = 0;
    for (const it of items) {
      const indicator_id = Number(it.indicator_id);
      if (!indicator_id) continue;

      // decide what to insert: score OR evidence_url/text
      const score = it.score ?? it.self_score ?? null;
      const evidence = it.evidence_url ?? it.text ?? null;

      await q(
        'INSERT INTO submissions (cycle_id,user_id,indicator_id,self_score,evidence_path,status) VALUES (?,?,?,?,?,?)',
        [
          cycle_id,
          req.user.id,
          indicator_id,
          score,
          evidence,
          status ?? 'submitted',
        ]
      );
      inserted++;
    }

    return res.json({
      status: 'success',
      message: `Saved ${inserted} item(s)`,
    });
  } catch (err) {
    console.error('self-evaluation error', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'บันทึกการประเมินตนเองไม่สำเร็จ' });
  }
}))

router.get('/progress', ah(async (req, res) => {
  const { cycle_id } = req.query;
  try {
    const total = await q('SELECT COUNT(*) AS t FROM indicators');
    const submitted = await q(
      'SELECT COUNT(*) AS t FROM submissions WHERE cycle_id=? AND user_id=?',
      [cycle_id, req.user.id]
    );
    res.json({
      status: 'success',
      data: { total: total[0].t, submitted: submitted[0].t },
    });
  } catch (err) {
    console.error('progress error', err);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงสถานะได้' });
  }
}))

export default router;
