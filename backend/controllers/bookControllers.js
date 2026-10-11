import Book from '../models/Book.js'

//GET /api/books - get all books
export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//GET /api/books/id -get book by id
export const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book)
            return res.status(404).json({ error: "Book not found" });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/books/search?q=title - search books
export const searchBooks = async (req, res) => {
    try {
        const query = req.query.q;
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//POST /api/books - add book (admin only)
export const addBook = async (req, res) => {
    try {
        const { title, author, category, isbn, totalCopies } = req.body;
        const book = await Book.create({
            title,
            author,
            category,
            isbn,
            totalCopies,
            availableCopies: totalCopies
        });

        res.status(201).json(book);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// PUT /api/books/:id - update book (admin only)
export const updateBook = async (req, res) => {
  try {
    const { title, author, category, isbn, totalCopies } = req.body

    // get current book first to calculate difference
    const currentBook = await Book.findById(req.params.id)
    if (!currentBook) return res.status(404).json({ error: 'Book not found' })

    // calculate how many are currently borrowed
    const currentlyBorrowed = currentBook.totalCopies - currentBook.availableCopies

    // new available = new total minus however many are still borrowed
    const newAvailableCopies = Number(totalCopies) - currentlyBorrowed

    if (newAvailableCopies < 0) {
      return res.status(400).json({ 
        error: `Cannot set total copies below ${currentlyBorrowed} — that many copies are currently borrowed` 
      })
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        category,
        isbn,
        totalCopies: Number(totalCopies),
        availableCopies: newAvailableCopies
      },
      { returnDocument: 'after' }
    )

    res.json(book)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
};

// DELETE /api/books/:id - delete book (admin only)
export const deleteBook = async (req, res) => {
     console.log('Delete request from user:', req.user);
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};