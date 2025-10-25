import express from 'express'
import { openDb } from '../db.js'
import { authRequired } from '../middleware/auth.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const router = express.Router()
async function q(sql,p=[]) {
  const db=await openDb();
  try { const [r]=await db.query(sql,p); return r }
  finally { try { db.end && db.end() } catch(_) {} }
}
const ah = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

router.use(authRequired)

// Helper to fetch font from URL
async function fetchFont(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`Font HTTP ${res.statusCode}`)) }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

// Load Thai-capable font from local repo or remote fallback
async function loadThaiFont() {
  const candidates = [
    path.join(__dirname, '../fonts/Sarabun-Regular.ttf'),
    path.join(__dirname, '../fonts/NotoSansThai-Regular.ttf'),
  ]
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p } catch (_) {}
  }
  return null
}

// สรุปผลรายคนในรอบประเมิน
router.get('/summary/:cycle_id', ah(async (req,res)=>{
  const { cycle_id } = req.params
  const rows = await q(`
    SELECT u.id AS user_id, u.name AS evaluatee,
           ROUND(AVG(COALESCE(r.score,s.self_score)),2) AS avg_score,
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

// Export รายบุคคล (PDF)
router.get('/export/:cycle_id/:user_id', ah(async (req,res)=>{
  const { cycle_id, user_id } = req.params
  const [info] = await q('SELECT name FROM users WHERE id=?',[user_id])
  if(!info) return res.status(404).json({status:'fail', message:'User not found'})

  const rows = await q(`
    SELECT t.name AS topic, i.title AS indicator, i.weight, s.self_score, r.score AS committee_score
    FROM submissions s
    JOIN indicators i ON i.id=s.indicator_id
    LEFT JOIN topics t ON t.id=i.topic_id
    LEFT JOIN reviews r ON r.submission_id=s.id
    WHERE s.cycle_id=? AND s.user_id=?
    ORDER BY t.id, i.id
  `,[cycle_id, user_id])

  // Safer headers for non-ASCII filenames
  // (Keep header setup here)
  res.setHeader('Content-Type','application/pdf')
  const baseName = String(info.name || 'user')
  const safeFile = `report_${baseName}`.replace(/[^\w.-]+/g, '_') + '.pdf'
  const utfFile = `report_${baseName}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename="${safeFile}"; filename*=UTF-8''${encodeURIComponent(utfFile)}`)

  const doc = new PDFDocument()
  doc.on('error', (err) => {
    console.error('PDF generation error:', err)
    try { res.end() } catch(_) {}
  })

  // Load Thai-capable font BEFORE piping, set fallback safely
  let hasThai = false
  try {
    const thaiPath = await loadThaiFont()
    if (thaiPath) {
      doc.registerFont('thai', thaiPath)
      try {
        doc.font('thai')
        hasThai = true
      } catch (e) {
        console.warn('Thai font not usable:', e)
        doc.font('Helvetica')
      }
    } else {
      doc.font('Helvetica')
    }
  } catch (e) {
    console.warn('Thai font load failed:', e)
    doc.font('Helvetica')
  }

  // Pipe AFTER font setup to avoid headers-sent on font errors
  doc.pipe(res)

  doc.fontSize(16).text('Individual Evaluation Report', { underline:true })
  doc.moveDown().fontSize(12).text(`Name: ${baseName}`)
  doc.moveDown()

  const margin = 50
  const pageWidth = doc.page.width
  const pageHeight = doc.page.height
  const usableWidth = pageWidth - margin * 2
  let y = Math.max(doc.y, margin)

  const colTopic = 140
  const colWeight = 60
  const colSelf = 70
  const colCommittee = 90
  const colIndicator = usableWidth - (colTopic + colWeight + colSelf + colCommittee)

  const drawHeader = () => {
    if (hasThai) { try { doc.font('thai') } catch { doc.font('Helvetica') } } else { doc.font('Helvetica') }
    const headerHeight = 24
    doc.save()
    doc.fillColor('#f2f2f2')
    doc.rect(margin, y, usableWidth, headerHeight).fill()
    doc.restore()

    doc.strokeColor('#cccccc')
    doc.rect(margin, y, colTopic, headerHeight).stroke()
    doc.rect(margin + colTopic, y, colIndicator, headerHeight).stroke()
    doc.rect(margin + colTopic + colIndicator, y, colWeight, headerHeight).stroke()
    doc.rect(margin + colTopic + colIndicator + colWeight, y, colSelf, headerHeight).stroke()
    doc.rect(margin + colTopic + colIndicator + colWeight + colSelf, y, colCommittee, headerHeight).stroke()

    doc.fillColor('black').fontSize(11)
    doc.text('หัวข้อ', margin + 6, y + 6, { width: colTopic - 12 })
    doc.text('ตัวชี้วัด', margin + colTopic + 6, y + 6, { width: colIndicator - 12 })
    doc.text('น้ำหนัก', margin + colTopic + colIndicator + 6, y + 6, { width: colWeight - 12 })
    doc.text('Self', margin + colTopic + colIndicator + colWeight + 6, y + 6, { width: colSelf - 12 })
    doc.text('Committee', margin + colTopic + colIndicator + colWeight + colSelf + 6, y + 6, { width: colCommittee - 12 })

    y += headerHeight
  }

  const drawRow = (row) => {
    if (hasThai) { try { doc.font('thai') } catch { doc.font('Helvetica') } } else { doc.font('Helvetica') }
    doc.fontSize(11)
    const topicText = String(row.topic ?? '-')
    const indicatorText = String(row.indicator ?? '-')
    const weightText = row.weight == null ? '-' : Number(row.weight).toFixed(2)
    const selfText = row.self_score == null ? '-' : String(row.self_score)
    const committeeText = row.committee_score == null ? '-' : String(row.committee_score)

    const padding = 6
    const hTopic = doc.heightOfString(topicText, { width: colTopic - padding * 2 })
    const hIndicator = doc.heightOfString(indicatorText, { width: colIndicator - padding * 2 })
    const hWeight = doc.heightOfString(weightText, { width: colWeight - padding * 2 })
    const hSelf = doc.heightOfString(selfText, { width: colSelf - padding * 2 })
    const hCommittee = doc.heightOfString(committeeText, { width: colCommittee - padding * 2 })

    const rowHeight = Math.max(hTopic, hIndicator, hWeight, hSelf, hCommittee) + padding * 2

    const bottomLimit = pageHeight - margin - 30
    if (y + rowHeight > bottomLimit) {
      doc.addPage()
      y = margin
      drawHeader()
    }

    doc.strokeColor('#dddddd')
    doc.rect(margin, y, colTopic, rowHeight).stroke()
    doc.rect(margin + colTopic, y, colIndicator, rowHeight).stroke()
    doc.rect(margin + colTopic + colIndicator, y, colWeight, rowHeight).stroke()
    doc.rect(margin + colTopic + colIndicator + colWeight, y, colSelf, rowHeight).stroke()
    doc.rect(margin + colTopic + colIndicator + colWeight + colSelf, y, colCommittee, rowHeight).stroke()

    doc.fillColor('black')
    doc.text(topicText, margin + padding, y + padding, { width: colTopic - padding * 2 })
    doc.text(indicatorText, margin + colTopic + padding, y + padding, { width: colIndicator - padding * 2 })
    doc.text(weightText, margin + colTopic + colIndicator + padding, y + padding, { width: colWeight - padding * 2, align: 'center' })
    doc.text(selfText, margin + colTopic + colIndicator + colWeight + padding, y + padding, { width: colSelf - padding * 2, align: 'center' })
    doc.text(committeeText, margin + colTopic + colIndicator + colWeight + colSelf + padding, y + padding, { width: colCommittee - padding * 2, align: 'center' })

    y += rowHeight
  }

  drawHeader()
  rows.forEach(drawRow)
  doc.end()
}))

export default router