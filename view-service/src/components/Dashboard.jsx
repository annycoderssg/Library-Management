import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboard();
        setStats(response.data.stats);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="dashboard"><h2>{error}</h2></div>;
  }

  return (
    <div className="dashboard">
      <h2>Library Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats?.total_books || 0}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.total_members || 0}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{stats?.total_borrowings || 0}</div>
          <div className="stat-label">Total Borrowings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔖</div>
          <div className="stat-value">{stats?.active_borrowings || 0}</div>
          <div className="stat-label">Active Borrowings</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats?.overdue_books || 0}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.available_books || 0}</div>
          <div className="stat-label">Available Books</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
