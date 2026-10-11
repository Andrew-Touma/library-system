import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import api from '../services/api'

function AdminDashboard({ user, onLogout }) {
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [allHistory, setAllHistory] = useState([])
  const [lateBooks, setLateBooks] = useState([])
  const [activeTab, setActiveTab] = useState('books')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [editingBook, setEditingBook] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [bookForm, setBookForm] = useState({
    title: '', author: '', category: '', isbn: '', totalCopies: ''
  })
  const [requests, setRequests] = useState([])

  useEffect(() => { fetchBooks() }, [])

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => setError(null), 3000)
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await api.get('/books')
      setBooks(res.data)
    } catch (err) {
      showError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchAllHistory = async () => {
    try {
      const res = await api.get('/admin/history')
      setAllHistory(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchLateBooks = async () => {
    try {
      const res = await api.get('/admin/late-books')
      setLateBooks(res.data)
    } catch (err) { console.error(err) }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'users') fetchUsers()
    if (tab === 'history') fetchAllHistory()
    if (tab === 'late') fetchLateBooks()
    if (tab === 'requests') fetchRequests()
  }

  const handleBookFormChange = (e) => {
    setBookForm({ ...bookForm, [e.target.name]: e.target.value })
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/books', { ...bookForm, totalCopies: Number(bookForm.totalCopies) })
      setBooks(prev => [...prev, res.data])
      setBookForm({ title: '', author: '', category: '', isbn: '', totalCopies: '' })
      setShowAddForm(false)
      showMessage('Book added successfully!')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to add book')
    }
  }

  const handleEditBook = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put(`/books/${editingBook._id}`, {
        ...bookForm,
        totalCopies: Number(bookForm.totalCopies)
      })
      setBooks(prev => prev.map(b => b._id === editingBook._id ? res.data : b))
      setEditingBook(null)
      setBookForm({ title: '', author: '', category: '', isbn: '', totalCopies: '' })
      showMessage('Book updated successfully!')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update book')
    }
  }

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await api.delete(`/books/${id}`)
      setBooks(prev => prev.filter(b => b._id !== id))
      showMessage('Book deleted!')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete book')
    }
  }

  const startEdit = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      totalCopies: book.totalCopies
    })
    setShowAddForm(false)
  }

  const handleSendNotice = async (userId) => {
    try {
      const res = await api.post('/admin/send-notice', { userId })
      showMessage(`Notice prepared for ${res.data.email} — ${res.data.overdueBooks.length} overdue book(s)`)
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to send notice')
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/admin')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateRequest = async (id, status, adminNote = '') => {
    try {
      await api.put(`/requests/admin/${id}`, { status, adminNote })
      await fetchRequests()
      showMessage(`Request ${status}!`)
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update request')
    }
  }

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await api.delete(`/requests/admin/${id}`)
      await fetchRequests()
      showMessage('Request deleted!')
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete request')
    }
  }

  const bookFormFields = (
    <div style={styles.formGrid}>
      {['title', 'author', 'category', 'isbn', 'totalCopies'].map(field => (
        <input
          key={field}
          style={styles.input}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={bookForm[field]}
          onChange={handleBookFormChange}
          type={field === 'totalCopies' ? 'number' : 'text'}
          required
        />
      ))}
    </div>
  )

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={onLogout} role="admin" />
      <div style={styles.container}>
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tabs}>
          {[
            { key: 'books', label: '📚 Books' },
            { key: 'users', label: '👥 Users' },
            { key: 'history', label: '📋 All History' },
            { key: 'late', label: '⚠️ Overdue' },
            { key: 'requests', label: '📨 Requests' }
          ].map(tab => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.activeTab : {}) }}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'books' && (
          <div>
            <button
              style={styles.btnAdd}
              onClick={() => { setShowAddForm(!showAddForm); setEditingBook(null) }}
            >
              {showAddForm ? 'Cancel' : '+ Add New Book'}
            </button>

            {showAddForm && (
              <form onSubmit={handleAddBook} style={styles.form}>
                <h3 style={{ margin: '0 0 16px' }}>Add New Book</h3>
                {bookFormFields}
                <button style={styles.btnSubmit} type="submit">Add Book</button>
              </form>
            )}

            {editingBook && (
              <form onSubmit={handleEditBook} style={styles.form}>
                <h3 style={{ margin: '0 0 16px' }}>Edit Book</h3>
                {bookFormFields}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={styles.btnSubmit} type="submit">Save Changes</button>
                  <button style={styles.btnCancel} type="button" onClick={() => setEditingBook(null)}>Cancel</button>
                </div>
              </form>
            )}

            {loading ? (
              <p style={styles.center}>Loading books...</p>
            ) : (
              <div style={styles.grid}>
                {books.map(book => (
                  <BookCard
                    key={book._id}
                    book={book}
                    isAdmin={true}
                    onEdit={startEdit}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            {users.length === 0 ? (
              <p style={styles.center}>No users found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Joined</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button style={styles.btnNotice} onClick={() => handleSendNotice(u._id)}>
                          Send Notice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {allHistory.length === 0 ? (
              <p style={styles.center}>No history yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Book</th>
                    <th style={styles.th}>Borrowed</th>
                    <th style={styles.th}>Due</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allHistory.map(record => (
                    <tr key={record._id}>
                      <td style={styles.td}>{record.userId?.name}</td>
                      <td style={styles.td}>{record.bookId?.title}</td>
                      <td style={styles.td}>{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td style={styles.td}>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            record.status === 'returned' ? '#c6f6d5' :
                              record.status === 'late' ? '#fed7d7' : '#bee3f8',
                          color:
                            record.status === 'returned' ? '#276749' :
                              record.status === 'late' ? '#9b2c2c' : '#2b6cb0'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <p style={styles.center}>No book requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.map(req => (
                  <div key={req._id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <div>
                        <h4 style={{ margin: 0, color: '#1a202c' }}>{req.title}</h4>
                        <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.9rem' }}>
                          by {req.author}
                        </p>
                        <p style={{ margin: '4px 0 0', color: '#a0aec0', fontSize: '0.85rem' }}>
                          Requested by {req.userId?.name} ({req.userId?.email})
                        </p>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          req.status === 'approved' ? '#c6f6d5' :
                            req.status === 'rejected' ? '#fed7d7' : '#fefcbf',
                        color:
                          req.status === 'approved' ? '#276749' :
                            req.status === 'rejected' ? '#9b2c2c' : '#744210'
                      }}>
                        {req.status}
                      </span>
                    </div>

                    {req.reason && (
                      <p style={{ color: '#4a5568', fontSize: '0.9rem', margin: '8px 0', fontStyle: 'italic' }}>
                        📝 Reason: {req.reason}
                      </p>
                    )}

                    <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: '4px 0 12px' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>

                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          style={styles.btnApprove}
                          onClick={() => {
                            const note = prompt('Add a note for the user (optional):') || ''
                            handleUpdateRequest(req._id, 'approved', note)
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          style={styles.btnReject}
                          onClick={() => {
                            const note = prompt('Reason for rejection (optional):') || ''
                            handleUpdateRequest(req._id, 'rejected', note)
                          }}
                        >
                          ❌ Reject
                        </button>
                        <button
                          style={styles.btnDelete}
                          onClick={() => handleDeleteRequest(req._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}

                    {req.status !== 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={styles.btnDelete}
                          onClick={() => handleDeleteRequest(req._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'late' && (
          <div>
            {lateBooks.length === 0 ? (
              <p style={styles.center}>No overdue books.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Book</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lateBooks.map(record => (
                    <tr key={record._id}>
                      <td style={styles.td}>{record.userId?.name}</td>
                      <td style={styles.td}>{record.userId?.email}</td>
                      <td style={styles.td}>{record.bookId?.title}</td>
                      <td style={styles.td}>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button style={styles.btnNotice} onClick={() => handleSendNotice(record.userId?._id)}>
                          Send Notice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '10px 20px', border: 'none', borderRadius: '8px',
    cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#4a5568', fontSize: '0.95rem'
  },
  activeTab: { backgroundColor: '#4f46e5', color: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  form: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px'
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  input: {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '0.95rem'
  },
  btnAdd: {
    padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    marginBottom: '20px', fontSize: '0.95rem'
  },
  btnSubmit: {
    padding: '10px 20px', backgroundColor: '#38a169', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem'
  },
  btnCancel: {
    padding: '10px 20px', backgroundColor: '#a0aec0', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem'
  },
  btnNotice: {
    padding: '6px 14px', backgroundColor: '#ed8936', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
  },
  center: { textAlign: 'center', color: '#718096', marginTop: '40px' },
  success: {
    backgroundColor: '#c6f6d5', color: '#276749', padding: '12px',
    borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
  },
  error: {
    backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '12px',
    borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' },
  th: { padding: '12px 16px', backgroundColor: '#f7fafc', textAlign: 'left', color: '#4a5568', fontWeight: '600', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568' },
  statusBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  requestCard: {
  backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
},
requestHeader: {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'flex-start', marginBottom: '8px'
},
btnApprove: {
  padding: '8px 16px', backgroundColor: '#38a169', color: '#fff',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
},
btnReject: {
  padding: '8px 16px', backgroundColor: '#e53e3e', color: '#fff',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
},
}

export default AdminDashboard;