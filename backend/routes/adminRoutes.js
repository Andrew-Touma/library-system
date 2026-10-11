import express from 'express';
import {
  getAllUsers,
  getUserHistory,
  getAllHistory,
  getLateBooks,
  manualCheckout,
  manualReturn,
  sendNotice
} from '../controllers/adminControllers.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/admin.js';

const router = express.Router();

// all routes here are protected — must be logged in AND be admin
router.use(auth, adminOnly);

router.get('/users', getAllUsers);
router.get('/users/:userId/history', getUserHistory);
router.get('/history', getAllHistory);
router.get('/late-books', getLateBooks);
router.post('/checkout', manualCheckout);
router.post('/return', manualReturn);
router.post('/send-notice', sendNotice);

export default router;