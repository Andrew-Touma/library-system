import express from "express";
import { getAllBooks, getBook, searchBooks, addBook, updateBook, deleteBook } from "../controllers/bookControllers.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/admin.js";

const router = express.Router();

router.get('/search',searchBooks);
router.get('/',getAllBooks);
router.get('/:id',getBook);

router.post('/',auth,adminOnly,addBook);
router.put('/:id',auth,adminOnly,updateBook);
router.delete('/:id', auth, adminOnly,deleteBook);

export default router;