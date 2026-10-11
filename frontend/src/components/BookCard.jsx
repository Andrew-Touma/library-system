import { useNavigate } from 'react-router-dom'

function BookCard({ book, onBorrow, onReturn, isBorrowed, isAdmin, onEdit, onDelete }) {
  const navigate = useNavigate()

   if (!book) return null

  const availableCopies = book.availableCopies ?? 0
  const totalCopies = book.totalCopies ?? 0

  return (
    <div style={styles.card}>
      <div style={styles.badge}>{book.category}</div>
      <h3 style={styles.title}>{book.title}</h3>
      <p style={styles.author}>by {book.author}</p>
      <p style={styles.info}>ISBN: {book.isbn}</p>
      <p style={styles.copies}>
        Available:{' '}
        <span style={{ color: availableCopies > 0 ? '#38a169' : '#e53e3e' }}>
          {availableCopies} / {totalCopies}
        </span>
      </p>
      <div style={styles.actions}>
        {isAdmin ? (
          <>
            <button style={styles.btnEdit} onClick={() => onEdit(book)}>Edit</button>
            <button style={styles.btnDelete} onClick={() => onDelete(book._id)}>Delete</button>
          </>
        ) : (
          <>
            {isBorrowed ? (
              <>
                <button style={styles.btnReturn} onClick={() => onReturn(book._id)}>
                  Return
                </button>
                <button style={styles.btnRead} onClick={() => navigate(`/read/${book._id}`)}>
                  Read Online
                </button>
              </>
            ) : (
              <button
                style={{ ...styles.btnBorrow, opacity: book.availableCopies === 0 ? 0.5 : 1 }}
                onClick={() => onBorrow(book._id)}
                disabled={book.availableCopies === 0}
              >
                {book.availableCopies === 0 ? 'Unavailable' : 'Borrow'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#ebf4ff',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    width: 'fit-content'
  },
  title: {
    fontSize: '1.1rem',
    color: '#1a202c',
    margin: 0
  },
  author: {
    color: '#718096',
    margin: 0,
    fontSize: '0.9rem'
  },
  info: {
    color: '#a0aec0',
    fontSize: '0.8rem',
    margin: 0
  },
  copies: {
    fontSize: '0.9rem',
    margin: 0
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  btnBorrow: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  btnReturn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  btnRead: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#38a169',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  btnEdit: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#ed8936',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  btnDelete: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
}

export default BookCard