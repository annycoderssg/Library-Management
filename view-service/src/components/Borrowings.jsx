import { useState, useEffect, useCallback, useRef } from 'react';
import { borrowingsAPI, booksAPI, membersAPI } from '../api';
import '../styles/Borrowings.css';
import {
    ErrorMessage,
    Modal,
    FormInput,
    FormActions,
    SectionHeader,
    ActionButtons,
} from './common';

function Borrowings() {
    const [borrowings, setBorrowings] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [returning, setReturning] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({
        book_id: '',
        member_id: '',
        due_date: '',
    });
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);
    const statusFilterRef = useRef('');

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const loadData = useCallback(async () => {
        // Only prevent duplicate if same filter and already loading
        if (loadingRef.current && statusFilterRef.current === statusFilter) return;

        loadingRef.current = true;
        statusFilterRef.current = statusFilter;

        try {
            const [borrowingsRes, booksRes, membersRes] = await Promise.all([
                borrowingsAPI.getAll(statusFilter ? { status_filter: statusFilter } : {}),
                booksAPI.getAll(),
                membersAPI.getAll(),
            ]);
            if (mountedRef.current) {
                setBorrowings(borrowingsRes.data);
                setBooks(booksRes.data);
                setMembers(membersRes.data);
                setError(null);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.response?.data?.detail || 'Failed to load data');
            }
        } finally {
            loadingRef.current = false;
        }
    }, [statusFilter]);

    useEffect(() => {
        // Load data when component mounts
        loadData();
    }, [loadData]);

    useEffect(() => {
        // Reload data when status filter changes
        if (!loadingRef.current) {
            loadData();
        }
    }, [statusFilter, loadData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const data = {
                book_id: parseInt(formData.book_id),
                member_id: parseInt(formData.member_id),
                due_date: formData.due_date,
            };
            await borrowingsAPI.create(data);
            setShowForm(false);
            resetForm();
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create borrowing');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = useCallback(async (id) => {
        if (returning === id) return;

        setReturning(id);
        setError(null);
        try {
            await borrowingsAPI.returnBook(id);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to return book');
        } finally {
            setReturning(null);
        }
    }, [returning, loadData]);

    const handleDelete = useCallback(async (id) => {
        if (deleting === id) return;

        if (window.confirm('Are you sure you want to delete this borrowing record?')) {
            setDeleting(id);
            setError(null);
            try {
                await borrowingsAPI.delete(id);
                await loadData();
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to delete borrowing');
            } finally {
                setDeleting(null);
            }
        }
    }, [deleting, loadData]);

    const resetForm = () => {
        setFormData({
            book_id: '',
            member_id: '',
            due_date: '',
        });
    };

    const handleCloseForm = () => {
        setShowForm(false);
        resetForm();
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'returned') return false;
        return new Date(dueDate) < new Date();
    };

    const bookOptions = books
        .filter(book => book.available_copies > 0)
        .map(book => ({
            id: book.id,
            label: book.title
        }));

    const memberOptions = members.map(member => ({
        id: member.id,
        label: member.name
    }));

    return (
        <div className="borrowings">
            <SectionHeader
                title="Borrowings Management"
                actions={
                    <>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Status</option>
                            <option value="borrowed">Borrowed</option>
                            <option value="returned">Returned</option>
                            <option value="overdue">Overdue</option>
                        </select>
                        <button className="btn-primary" onClick={() => { setShowForm(true); resetForm(); }}>
                            + New Borrowing
                        </button>
                    </>
                }
            />

            <ErrorMessage message={error} onClose={() => setError(null)} />

            <Modal
                isOpen={showForm}
                onClose={handleCloseForm}
                title="Record New Borrowing"
            >
                <form onSubmit={handleSubmit}>
                    <FormInput
                        type="select"
                        label="Book"
                        required
                        value={formData.book_id}
                        onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                        options={bookOptions}
                    />
                    <FormInput
                        type="select"
                        label="Member"
                        required
                        value={formData.member_id}
                        onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                        options={memberOptions}
                    />
                    <FormInput
                        type="date"
                        label="Due Date"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <FormActions onCancel={handleCloseForm} disabled={submitting}>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </FormActions>
                </form>
            </Modal>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Book</th>
                            <th>Member</th>
                            <th>Borrow Date</th>
                            <th>Due Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                            <th>Fine</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowings.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="empty-state">
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                                        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>No record found</div>
                                        <div style={{ marginBottom: '1rem', color: '#666' }}>
                                            {statusFilter ? `No ${statusFilter} borrowings found` : 'Get started by recording your first borrowing'}
                                        </div>
                                        {!statusFilter && (
                                            <button
                                                className="btn-primary"
                                                onClick={() => { setShowForm(true); resetForm(); }}
                                            >
                                                + Record New Borrowing
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            borrowings.map((borrowing) => {
                                const overdue = isOverdue(borrowing.due_date, borrowing.status);
                                const isProcessing = returning === borrowing.id || deleting === borrowing.id;
                                return (
                                    <tr key={borrowing.id} className={overdue ? 'overdue' : ''}>
                                        <td>{borrowing.id}</td>
                                        <td>{borrowing.book.title}</td>
                                        <td>{borrowing.member.name}</td>
                                        <td>{new Date(borrowing.borrow_date).toLocaleDateString()}</td>
                                        <td className={overdue ? 'overdue-date' : ''}>
                                            {new Date(borrowing.due_date).toLocaleDateString()}
                                        </td>
                                        <td>{borrowing.return_date ? new Date(borrowing.return_date).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${borrowing.status}`}>
                                                {borrowing.status}
                                            </span>
                                        </td>
                                        <td>${parseFloat(borrowing.fine_amount).toFixed(2)}</td>
                                        <td>
                                            <ActionButtons
                                                onDelete={() => handleDelete(borrowing.id)}
                                                onReturn={borrowing.status === 'borrowed' ? () => handleReturn(borrowing.id) : null}
                                                showReturn={borrowing.status === 'borrowed'}
                                                disabled={isProcessing || submitting}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Borrowings;
