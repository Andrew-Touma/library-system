# Library Management System

A full-stack library management application built with the MERN stack (MongoDB, Express, React, Node.js) designed to streamline book borrowing, returns, and administrative library operations. Page Link : https://library-system-frontend-ozlg.onrender.com/

##  Features

###  User Features
The system provides a comprehensive set of tools for library members to manage their reading materials:

- **Account Management**
  - User registration and secure login.
  - Personal borrowing history tracking.
  - View current active borrows.

- **Book Discovery**
  - Browse all available books in the library.
  - Search for specific books by title, author, or category.
  - View detailed information for individual books.

- **Borrowing Workflow**
  - Request to borrow available books.
  - Return borrowed books.
  - Track due dates and return status.

- **Book Requests**
  - Request the library to acquire new books.
  - Track the status of requests (Pending, Approved, Rejected).
  - Receive admin notes regarding request status.

---

###  Admin Features
A powerful administrative dashboard for managing the library's inventory and users:

- **Inventory Management**
  - Add new books to the catalog.
  - Update book details (copies, categories, etc.).
  - Remove books from the collection.

- **Borrowing Administration**
  - Manually check out books for users.
  - Manually process book returns.
  - Monitor all library borrowing history.
  - Identify and track late books.
  - Send notices to users with overdue materials.

- **User & Request Oversight**
  - View and manage all registered users.
  - Inspect specific user borrowing history.
  - Review, approve, or reject book acquisition requests.
  - Add administrative notes to requests.

- **System Control**
  - Dedicated secure admin login.
  - Role-based access control (RBAC) to protect sensitive operations.

##  Technical Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: 
  - JWT (JSON Web Tokens) for authentication.
  - Bcrypt for password hashing.
  - Role-based middleware for admin/user separation.
  - Rate limiting to prevent API abuse.

##  Project Structure

```text
.
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/     # Business logic for auth, books, borrows, requests, and admin
│   ├── middleware/      # Auth, Admin, and Rate-limit guards
│   ├── models/          # MongoDB schemas (User, Book, Borrow, Request, Admin)
│   ├── routes/          # API endpoint definitions
│   └── server.js        # Application entry point
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page-level components
    │   └── services/     # API integration layer
    └── ...
```
