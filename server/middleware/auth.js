import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

// สร้าง token สำหรับผู้ใช้
export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' } // เพิ่มเวลาหมดอายุเป็น 24 ชั่วโมง
  )
}

// ตรวจสอบว่ามี token หรือไม่
export function authRequired(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, '') || ''
    if (!token) throw new Error('No token')
    
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (e) {
    return res.status(401).json({ 
      status: 'error', 
      message: e.message === 'No token' ? 'กรุณาเข้าสู่ระบบ' : 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่' 
    })
  }
}

// ตรวจสอบสิทธิ์ตาม role
export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' 
      })
    }
    next()
  }
}