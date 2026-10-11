import User from '../models/User.js';
import Borrow from '../models/Borrow.js';

// GET /api/admin/users - get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users/:userId/history - specific user's borrow history
export const getUserHistory = async (req, res) => {
  try {
    const records = await Borrow.find({ userId: req.params.userId })
      .populate('bookId', 'title author') //populate merges info fetching data based on the fields passed otherwise only ids will be shown
      .populate('userId', 'name email')
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/history - all borrow records across all users
export const getAllHistory = async (req, res) => {
  try {
    const records = await Borrow.find()
      .populate('bookId', 'title author')
      .populate('userId', 'name email')
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/late-books - all overdue borrows
export const getLateBooks = async (req, res) => {
  try {
    const now = new Date();

    // find borrowed records past due date
    const lateRecords = await Borrow.find({
      status: 'borrowed',
      dueDate: { $lt: now }
    })
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email')
      .sort({ dueDate: 1 });

    // auto mark them as late in the database
    await Borrow.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'late' } }
    );

    res.json(lateRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/checkout - manually check out a book for a user
export const manualCheckout = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies < 1) return res.status(400).json({ error: 'No copies available' });

    const existing = await Borrow.findOne({ userId, bookId, status: 'borrowed' });
    if (existing) return res.status(400).json({ error: 'User already has this book borrowed' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({ userId, bookId, dueDate });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/return - manually process a return for a user
export const manualReturn = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const borrow = await Borrow.findOne({ userId, bookId, status: 'borrowed' });
    if (!borrow) return res.status(404).json({ error: 'No active borrow record found' });

    const now = new Date();
    borrow.returnDate = now;
    borrow.status = now > borrow.dueDate ? 'late' : 'returned';
    await borrow.save();

    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/send-notice - send overdue notice to a user
export const sendNotice = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const lateBooks = await Borrow.find({ userId, status: 'late' })
      .populate('bookId', 'title author');

    if (lateBooks.length === 0) {
      return res.status(400).json({ error: 'No overdue books for this user' });
    }

    //returned data for now use node mailer to send actual emails
    res.json({
      message: `Notice prepared for ${user.name}`,
      email: user.email,
      overdueBooks: lateBooks.map(b => ({
        title: b.bookId.title,
        author: b.bookId.author,
        dueDate: b.dueDate,
        daysLate: Math.floor((new Date() - b.dueDate) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};