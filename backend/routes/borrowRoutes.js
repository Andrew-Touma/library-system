import express from "express";
import { borrowBook, returnBook, myHistory, currentBorrows} from "../controllers/borrowControllers.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/admin.js";

const router = express.Router();

router.post('/borrow/:bookId', auth,borrowBook);
router.post('/return/:bookId', auth, returnBook);
router.get('/history', auth, myHistory);
router.get('/current', auth, currentBorrows);

export default router;
