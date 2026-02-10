import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { booksAPI, borrowingsAPI, dashboardAPI } from '../api';
import '../styles/Books.css';
import Pagination from './Pagination';
import {
    ErrorMessage,
    Modal,
    ConfirmationModal,
    FormInput,
    FormRow,
    FormActions,
    SectionHeader,
    ActionButtons,
} from './common';

function Books() {
    const [books, setBooks] = useState([]);
    const [userBorrowings, setUserBorrowings] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [borrowing, setBorrowing] = useState(null);
    const [returning, setReturning] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [showReturnConfirm, setShowReturnConfirm] = useState(false);
    const [returningBorrowingId, setReturningBorrowingId] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowDueDate, setBorrowDueDate] = useState('');
    const [editingBook, setEditingBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const itemsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        published_year: '',
        total_copies: 1,
        available_copies: 1,
    });
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);
    const navigate = useNavigate();

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Get user info directly from localStorage (no need for state since it doesn't change during component lifecycle)
    const getUser = () => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    };

    const loadBooks = useCallback(async () => {
        if (loadingRef.current) {
            // Reset loading flag after a short delay to allow retry
            setTimeout(() => {
                loadingRef.current = false;
            }, 100);
            return;
        }

        loadingRef.current = true;
        try {
            const skip = (currentPage - 1) * itemsPerPage;
            const response = await booksAPI.getAll(skip, itemsPerPage, searchTerm);
            if (mountedRef.current) {
                if (response.data && response.data.items) {
                    // New paginated response format
                    setBooks(response.data.items);
                    setTotalItems(response.data.total || 0);
                } else {
                    // Fallback for old format
                    const booksData = Array.isArray(response.data) ? response.data : [];
                    setBooks(booksData);
                    setTotalItems(booksData.length);
                }
                setError(null);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.response?.data?.detail || 'Failed to load books');
                setBooks([]); // Clear books on error
                setTotalItems(0);
            }
        } finally {
            loadingRef.current = false;
        }
    }, [currentPage, itemsPerPage, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const loadUserBorrowings = useCallback(async () => {
        // Check if user is member before making API call
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin') return;

        try {
            const response = await dashboardAPI.getUserDashboard();
            if (mountedRef.current) {
                setUserBorrowings(response.data);
            }
        } catch {
            // Silently fail - user might not have borrowings
            if (mountedRef.current) {
                setUserBorrowings([]);
            }
        }
    }, []); // Remove user dependency to avoid unnecessary calls

    useEffect(() => {
        // Load data when component mounts
        loadBooks();

        // Only load user borrowings if user is a member
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role === 'member') {
                loadUserBorrowings();
            }
        }
    }, [loadBooks, loadUserBorrowings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const data = {
                ...formData,
                published_year: formData.published_year ? parseInt(formData.published_year) : null,
                total_copies: parseInt(formData.total_copies),
                available_copies: parseInt(formData.available_copies),
            };

            if (editingBook) {
                await booksAPI.update(editingBook.id, data);
            } else {
                await booksAPI.create(data);
            }
            setShowForm(false);
            setEditingBook(null);
            resetForm();
            await loadBooks();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save book');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            published_year: book.published_year || '',
            total_copies: book.total_copies,
            available_copies: book.available_copies,
        });
        setShowForm(true);
    };

    const handleDelete = useCallback(async (id) => {
        if (deleting === id) return;

        if (window.confirm('Are you sure you want to delete this book?')) {
            setDeleting(id);
            setError(null);
            try {
                await booksAPI.delete(id);
                await loadBooks();
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to delete book');
            } finally {
                setDeleting(null);
            }
        }
    }, [deleting, loadBooks]);

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            isbn: '',
            published_year: '',
            total_copies: 1,
            available_copies: 1,
        });
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingBook(null);
        resetForm();
    };

    const handleBorrow = (book) => {
        if (!user || user.role === 'admin') {
            navigate('/login');
            return;
        }
        setSelectedBook(book);
        // Set default due date to 30 days from now
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        setBorrowDueDate(defaultDueDate.toISOString().split('T')[0]);
        setShowBorrowModal(true);
    };

    const handleBorrowSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook || !borrowDueDate) return;

        setBorrowing(selectedBook.id);
        setError(null);
        setSuccess(null);

        try {
            // Backend will automatically use current user's member_id
            await borrowingsAPI.create({
                book_id: selectedBook.id,
                due_date: borrowDueDate
            });
            setSuccess(`Successfully borrowed "${selectedBook.title}"!`);
            setShowBorrowModal(false);
            setSelectedBook(null);
            setBorrowDueDate('');
            await loadBooks();
            await loadUserBorrowings();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to borrow book');
        } finally {
            setBorrowing(null);
        }
    };

    const handleReturnClick = (borrowingId) => {
        if (returning === borrowingId) return;
        setReturningBorrowingId(borrowingId);
        setShowReturnConfirm(true);
    };

    const handleReturnConfirm = async () => {
        if (!returningBorrowingId) return;

        setReturning(returningBorrowingId);
        setError(null);
        setSuccess(null);
        setShowReturnConfirm(false);

        try {
            await borrowingsAPI.returnBook(returningBorrowingId);
            setSuccess('Book returned successfully!');
            // Reload both in parallel to avoid sequential delays
            await Promise.all([loadBooks(), loadUserBorrowings()]);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to return book');
        } finally {
            setReturning(null);
            setReturningBorrowingId(null);
        }
    };

    const isBookBorrowedByUser = (bookId) => {
        return userBorrowings.some(b => b.book.id === bookId && b.status === 'borrowed');
    };

    const getUserBorrowing = (bookId) => {
        return userBorrowings.find(b => b.book.id === bookId && b.status === 'borrowed');
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const user = getUser(); // Get user from localStorage
    const isAdmin = user && user.role === 'admin';

    return (
        <div className="books">
            {isAdmin ? (
                <SectionHeader
                    title="Books Management"
                    actions={
                        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingBook(null); resetForm(); }}>
                            + Add Book
                        </button>
                    }
                />
            ) : (
                <div className="books-header">
                    <div className="books-header-left">
                        <Link to="/user/dashboard" className="home-icon-link" title="Home">
                            <span className="home-icon">🏠</span>
                        </Link>
                        <h2 className="books-title">Available Books</h2>
                    </div>
                    <div className="user-actions">
                        <button className="btn-secondary" onClick={() => navigate('/user/dashboard')}>
                            Dashboard
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/books')}>
                            Books
                        </button>
                    </div>
                </div>
            )}

            <ErrorMessage message={error} onClose={() => setError(null)} />
            {success && (
                <div className="success-message">
                    <span>{success}</span>
                    <button className="success-close-btn" onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            {/* Search Box */}
            <div className="search-box">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn-search">🔍 Search</button>
                    {searchTerm && (
                        <button type="button" className="btn-clear" onClick={handleClearSearch}>✕ Clear</button>
                    )}
                </form>
                {searchTerm && (
                    <p className="search-results-info">
                        Showing results for: <strong>"{searchTerm}"</strong> ({totalItems} found)
                    </p>
                )}
            </div>

            {/* Show pending due books for members - Only show books due within 7 days or overdue */}
            {!isAdmin && (() => {
                const pendingBorrowings = userBorrowings.filter((borrowing) => {
                    const daysUntilDue = getDaysUntilDue(borrowing.due_date);
                    return daysUntilDue <= 7; // Show books due within 7 days or overdue
                });

                return pendingBorrowings.length > 0 && (
                    <div className="pending-books-section">
                        <h3 className="pending-books-title">⚠️ Pending Due Books</h3>
                        <div className="pending-books-list">
                            {pendingBorrowings.map((borrowing) => {
                                const daysUntilDue = getDaysUntilDue(borrowing.due_date);
                                const isOverdue = daysUntilDue < 0;
                                return (
                                    <span key={borrowing.id} className={`pending-books-badge ${isOverdue ? 'overdue' : ''}`}>
                                        {borrowing.book.title} - {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `Due in ${daysUntilDue} days`}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Borrow Book Modal for Members */}
            {!isAdmin && (
                <Modal
                    isOpen={showBorrowModal}
                    onClose={() => { setShowBorrowModal(false); setSelectedBook(null); setBorrowDueDate(''); }}
                    title="Borrow Book"
                >
                    {selectedBook && (
                        <form onSubmit={handleBorrowSubmit}>
                            <div className="borrow-modal-info">
                                <p><strong>Book:</strong> {selectedBook.title}</p>
                                <p><strong>Author:</strong> {selectedBook.author}</p>
                                <p><strong>Available Copies:</strong> {selectedBook.available_copies}</p>
                            </div>
                            <FormInput
                                type="date"
                                label="Due Date"
                                required
                                value={borrowDueDate}
                                onChange={(e) => setBorrowDueDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <FormActions onCancel={() => { setShowBorrowModal(false); setSelectedBook(null); setBorrowDueDate(''); }} disabled={borrowing}>
                                <button type="submit" className="btn-primary" disabled={borrowing || selectedBook.available_copies === 0}>
                                    {borrowing ? 'Borrowing...' : 'Borrow Book'}
                                </button>
                            </FormActions>
                        </form>
                    )}
                </Modal>
            )}

            {/* Return Confirmation Modal */}
            <ConfirmationModal
                isOpen={showReturnConfirm}
                onClose={() => {
                    setShowReturnConfirm(false);
                    setReturningBorrowingId(null);
                }}
                onConfirm={handleReturnConfirm}
                title="Return Book"
                message="Are you sure you want to return this book?"
                confirmText="Return Book"
                cancelText="Cancel"
                confirmButtonClass="btn-return"
                isProcessing={returning !== null}
            />

            {/* Add/Edit Book Modal for Admin */}
            {isAdmin && (
                <Modal
                    isOpen={showForm}
                    onClose={handleCloseForm}
                    title={editingBook ? 'Edit Book' : 'Add New Book'}
                >
                    <form onSubmit={handleSubmit}>
                        <FormInput
                            type="text"
                            label="Title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormInput
                            type="text"
                            label="Author"
                            required
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                        <FormInput
                            type="text"
                            label="ISBN"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                        <FormInput
                            type="number"
                            label="Published Year"
                            value={formData.published_year}
                            onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                        />
                        <FormRow>
                            <FormInput
                                type="number"
                                label="Total Copies"
                                required
                                min="1"
                                value={formData.total_copies}
                                onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                            />
                            <FormInput
                                type="number"
                                label="Available Copies"
                                required
                                min="0"
                                value={formData.available_copies}
                                onChange={(e) => setFormData({ ...formData, available_copies: e.target.value })}
                            />
                        </FormRow>
                        <FormActions onCancel={handleCloseForm} disabled={submitting}>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save'}
                            </button>
                        </FormActions>
                    </form>
                </Modal>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            {isAdmin && <th>ISBN</th>}
                            {isAdmin && <th>Year</th>}
                            {isAdmin && <th>Total</th>}
                            <th>Available</th>
                            {!isAdmin && <th>Status</th>}
                            {!isAdmin && <th>Due Date</th>}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!books || books.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 8 : 7} className="empty-state">
                                    <div className="empty-state-content">
                                        <div className="empty-state-icon">📚</div>
                                        <div className="empty-state-title">No record found</div>
                                        <div className="empty-state-message">Get started by adding your first book to the library</div>
                                        <button
                                            className="btn-primary"
                                            onClick={() => { setShowForm(true); setEditingBook(null); resetForm(); }}
                                        >
                                            + Add Your First Book
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => {
                                if (!book || !book.id) return null;

                                const isBorrowed = isBookBorrowedByUser(book.id);
                                const userBorrowing = getUserBorrowing(book.id);
                                const daysUntilDue = userBorrowing ? getDaysUntilDue(userBorrowing.due_date) : null;
                                const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

                                return (
                                    <tr key={book.id} className={isOverdue ? 'overdue-row' : ''}>
                                        <td>{book.id}</td>
                                        <td>{book.title || '-'}</td>
                                        <td>{book.author || '-'}</td>
                                        {isAdmin && <td>{book.isbn || '-'}</td>}
                                        {isAdmin && <td>{book.published_year || '-'}</td>}
                                        {isAdmin && <td>{book.total_copies || 0}</td>}
                                        <td className={book.available_copies === 0 ? 'unavailable' : ''}>
                                            {book.available_copies || 0}
                                        </td>
                                        {!isAdmin && (
                                            <td>
                                                {isBorrowed ? (
                                                    <span className={`book-status-badge ${isOverdue ? 'overdue' : 'borrowed'}`}>
                                                        {isOverdue ? '⚠️ Overdue' : '📖 Borrowed'}
                                                    </span>
                                                ) : (
                                                    <span className="book-status-available">Available</span>
                                                )}
                                            </td>
                                        )}
                                        {!isAdmin && (
                                            <td>
                                                {userBorrowing ? (
                                                    <span className={isOverdue ? 'overdue-text' : ''}>
                                                        {new Date(userBorrowing.due_date).toLocaleDateString()}
                                                        {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        )}
                                        <td>
                                            {isAdmin ? (
                                                <ActionButtons
                                                    onEdit={() => handleEdit(book)}
                                                    onDelete={() => handleDelete(book.id)}
                                                    disabled={deleting === book.id || submitting}
                                                />
                                            ) : (
                                                <div className="book-action-buttons">
                                                    {isBorrowed ? (
                                                        <button
                                                            className="btn-return"
                                                            onClick={() => handleReturnClick(userBorrowing.id)}
                                                            disabled={returning === userBorrowing.id}
                                                        >
                                                            {returning === userBorrowing.id ? 'Returning...' : 'Return'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={`btn-borrow ${book.available_copies === 0 ? 'disabled' : ''}`}
                                                            onClick={() => handleBorrow(book)}
                                                            disabled={book.available_copies === 0 || borrowing === book.id}
                                                        >
                                                            {borrowing === book.id ? 'Borrowing...' : book.available_copies === 0 ? 'Unavailable' : 'Borrow'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                />
            )}
        </div>
    );
}

export default Books;
