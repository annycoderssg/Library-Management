import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total_books: 0,
    total_members: 0,
    total_borrowings: 0,
    active_borrowings: 0,
    overdue_books: 0,
    available_books: 0,
  });
  const [newBooks, setNewBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      const data = response.data;

      if (data.stats) {
        setStats(data.stats);
      }
      if (data.new_books) {
        setNewBooks(data.new_books);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Library Statistics</h2>
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2>Library Statistics</h2>
        <div className="error-message">{error}</div>
        <button onClick={loadDashboard} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Library Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.total_books}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total_members}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{stats.total_borrowings}</div>
          <div className="stat-label">Total Borrowings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔖</div>
          <div className="stat-value">{stats.active_borrowings}</div>
          <div className="stat-label">Active Borrowings</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats.overdue_books}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.available_books}</div>
          <div className="stat-label">Available Books</div>
        </div>
      </div>

      {newBooks.length > 0 && (
        <div className="new-books-section">
          <h3>Recently Added Books</h3>
          <div className="new-books-list">
            {newBooks.slice(0, 4).map((book) => (
              <div key={book.id} className="new-book-card">
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>
                <div className="book-copies">{book.available_copies}/{book.total_copies} available</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
