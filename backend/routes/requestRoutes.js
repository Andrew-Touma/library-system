import express from 'express'
import {
  createRequest,
  myRequests,
  getAllRequests,
  updateRequest,
  deleteRequest
} from '../controllers/requestControllers.js'
import auth from '../middleware/auth.js'
import adminOnly from '../middleware/admin.js'

const router = express.Router()

// user routes
router.post('/', auth, createRequest)
router.get('/my', auth, myRequests)

// admin routes
router.get('/admin', auth, adminOnly, getAllRequests)
router.put('/admin/:id', auth, adminOnly, updateRequest)
router.delete('/admin/:id', auth, adminOnly, deleteRequest)

export default router;