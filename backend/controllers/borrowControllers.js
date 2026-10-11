import Borrow from '../models/Borrow.js';
import Book from '../models/Book.js';

// POST /api/borrow/:bookId - borrow a book
export const borrowBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies < 1) return res.status(400).json({ error: 'No copies available' });

    // check if user already borrowed this book and hasn't returned it
    const existing = await Borrow.findOne({
      userId: req.user.id,
      bookId: req.params.bookId,
      status: 'borrowed'
    });
    if (existing) return res.status(400).json({ error: 'You already have this book borrowed' });

    // due date = 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      userId: req.user.id,
      bookId: req.params.bookId,
      dueDate
    });

    // use findByIdAndUpdate instead of save() — more reliable
    await Book.findByIdAndUpdate(
      req.params.bookId,
      { $inc: { availableCopies: -1 } },  // $inc decrements by 1 atomically
      { returnDocument: 'after' }
    )

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/return/:bookId - return a book
export const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findOne({
      userId: req.user.id,
      bookId: req.params.bookId,
      status: 'borrowed'
    });
    if (!borrow) return res.status(404).json({ error: 'No active borrow record found' });

    // check if late
    const now = new Date();
    borrow.returnDate = now;
    borrow.status = now > borrow.dueDate ? 'late' : 'returned';
    await borrow.save();

    // use $inc to increment back by 1 atomically
    await Book.findByIdAndUpdate(
      req.params.bookId,
      { $inc: { availableCopies: 1 } },
      { returnDocument: 'after' }
    )

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/history - logged in user's borrow history
export const myHistory = async (req, res) => {
  try {
    const records = await Borrow.find({ userId: req.user.id })
      .populate({
        path: 'bookId',
        select: 'title author isbn category totalCopies availableCopies'
      })
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/current - currently borrowed books
export const currentBorrows = async (req, res) => {
  try {
    const records = await Borrow.find({ userId: req.user.id, status: 'borrowed' })
      .populate({
        path: 'bookId',
        select: 'title author isbn category totalCopies availableCopies'
      })
      .sort({ dueDate: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};