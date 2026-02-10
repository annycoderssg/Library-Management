import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardAPI, borrowingsAPI } from '../api';
import { ConfirmationModal } from './common';
import '../styles/UserDashboard.css';

function UserDashboard() {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReturnConfirm, setShowReturnConfirm] = useState(false);
    const [returningBorrowingId, setReturningBorrowingId] = useState(null);
    const [returning, setReturning] = useState(false);
    const navigate = useNavigate();

    const loadUserDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await dashboardAPI.getUserDashboard();
            setBorrowings(response.data || []);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.detail || 'Error loading dashboard');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadUserDashboard();
    }, [navigate, loadUserDashboard]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleReturnClick = (borrowingId) => {
        setReturningBorrowingId(borrowingId);
        setShowReturnConfirm(true);
    };

    const handleReturnConfirm = async () => {
        if (!returningBorrowingId) return;

        setReturning(true);
        setError('');
        setShowReturnConfirm(false);

        try {
            await borrowingsAPI.returnBook(returningBorrowingId);
            await loadUserDashboard();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to return book');
        } finally {
            setReturning(false);
            setReturningBorrowingId(null);
        }
    };

    if (loading) {
        return <div className="user-dashboard-loading">Loading your dashboard...</div>;
    }

    return (
        <div className="user-dashboard-container">
            <div className="user-dashboard-header">
                <Link to="/user/dashboard" className="home-icon-link" title="Home">
                    <span className="home-icon">🏠</span>
                </Link>
                <h2>My Dashboard</h2>
                {/* <div className="user-actions">
                    <button className="btn-secondary" onClick={() => navigate('/user/dashboard')}>
                        Dashboard
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/books')}>
                        Books
                    </button>
                </div> */}
            </div>

            {error && <div className="error-message">{error}</div>}

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
                isProcessing={returning}
            />

            {/* Pending Due Books Section - Show only books due within 7 days or overdue */}
            {(() => {
                const pendingBorrowings = borrowings.filter((borrowing) => {
                    const daysUntilDue = getDaysUntilDue(borrowing.due_date);
                    return daysUntilDue <= 7; // Show books due within 7 days or overdue
                });

                return pendingBorrowings.length > 0 && (
                    <div className="pending-due-section">
                        <h3 className="pending-due-title">⚠️ Pending Due Books</h3>
                        <div className="pending-due-grid">
                            {pendingBorrowings.map((borrowing) => {
                                const daysUntilDue = getDaysUntilDue(borrowing.due_date);
                                const isOverdue = daysUntilDue < 0;

                                return (
                                    <div key={borrowing.id} className={`pending-due-card ${isOverdue ? 'overdue' : ''}`}>
                                        <h4 className="pending-due-card-title">{borrowing.book.title}</h4>
                                        <p className="pending-due-card-author">by {borrowing.book.author}</p>
                                        <p className={`pending-due-card-status ${isOverdue ? 'overdue' : ''}`}>
                                            {isOverdue
                                                ? `⚠️ ${Math.abs(daysUntilDue)} days overdue`
                                                : `Due in ${daysUntilDue} day(s)`}
                                        </p>
                                        <p className="pending-due-card-date">
                                            Due Date: {formatDate(borrowing.due_date)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            <div className="borrowings-section">
                <h3>My Borrowed Books</h3>
                {borrowings.length === 0 ? (
                    <div className="no-borrowings">
                        <p>You don't have any borrowed books at the moment.</p>
                        <button className="btn-primary" onClick={() => navigate('/books')}>
                            Browse Available Books
                        </button>
                    </div>
                ) : (
                    <div className="borrowings-list">
                        {borrowings.map((borrowing) => {
                            const daysUntilDue = getDaysUntilDue(borrowing.due_date);
                            const isOverdue = daysUntilDue < 0;

                            return (
                                <div key={borrowing.id} className={`borrowing-card ${isOverdue ? 'overdue' : ''}`}>
                                    <div className="borrowing-book-info">
                                        <h4>{borrowing.book.title}</h4>
                                        <p className="book-author">by {borrowing.book.author}</p>
                                    </div>

                                    <div className="borrowing-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Borrowed:</span>
                                            <span>{formatDate(borrowing.borrow_date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Due Date:</span>
                                            <span className={isOverdue ? 'overdue-text' : ''}>
                                                {formatDate(borrowing.due_date)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className={`status-badge ${borrowing.status}`}>
                                                {borrowing.status}
                                            </span>
                                        </div>
                                        {isOverdue && (
                                            <div className="detail-item overdue-warning">
                                                <span className="detail-label">Days Overdue:</span>
                                                <span className="overdue-text">{Math.abs(daysUntilDue)} days</span>
                                            </div>
                                        )}
                                        {!isOverdue && daysUntilDue <= 3 && (
                                            <div className="detail-item due-soon-warning">
                                                <span className="detail-label">Due Soon:</span>
                                                <span>{daysUntilDue} day(s) remaining</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="return-button-container">
                                        <button
                                            className="btn-return"
                                            onClick={() => handleReturnClick(borrowing.id)}
                                            disabled={returning}
                                        >
                                            {returning ? 'Returning...' : 'Return Book'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;

