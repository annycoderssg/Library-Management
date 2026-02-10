import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../api';
import '../styles/Header.css';

function Header() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const profileCacheRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const fetchingProfileRef = useRef(false);

  // Cached function to fetch user profile with debouncing
  const fetchUserProfile = useCallback(async (userId) => {
    // Check local cache first
    if (profileCacheRef.current && profileCacheRef.current.userId === userId) {
      setUserName(profileCacheRef.current.userName);
      return;
    }

    // Prevent multiple simultaneous calls
    if (fetchingProfileRef.current) return;
    fetchingProfileRef.current = true;

    try {
      // Use shared API cache to prevent duplicate calls
      const profileResponse = await authAPI.getProfile(false); // Don't force refresh
      const profile = profileResponse.data;
      let name = null;

      if (profile.member && profile.member.name) {
        name = profile.member.name;
      } else if (profile.user && profile.user.email) {
        name = profile.user.email.split('@')[0];
      }

      // Cache the result locally
      if (userId) {
        profileCacheRef.current = { userId, userName: name };
      }
      setUserName(name);
    } catch {
      // If profile fetch fails, try to get name from email
      try {
        const userInfoResponse = await authAPI.getCurrentUser();
        if (userInfoResponse.data && userInfoResponse.data.email) {
          const name = userInfoResponse.data.email.split('@')[0];
          if (userId) {
            profileCacheRef.current = { userId, userName: name };
          }
          setUserName(name);
        } else {
          setUserName(null);
        }
      } catch {
        setUserName(null);
      }
    } finally {
      fetchingProfileRef.current = false;
    }
  }, []);

  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Debounce profile fetch to avoid multiple calls
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          fetchUserProfile(parsedUser.user_id);
        }, 300); // 300ms debounce
      } else {
        setUser(null);
        setUserName(null);
        profileCacheRef.current = null; // Clear cache on logout
      }
    };

    // Initial load
    updateUser();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', updateUser);

    // Listen for custom login/logout events (same tab)
    const handleUserLogin = () => updateUser();
    const handleUserLogout = () => {
      setUser(null);
      setUserName(null);
      profileCacheRef.current = null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchUserProfile]); // Only depend on fetchUserProfile, not location

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  // Build tabs based on user role
  const getTabs = () => {
    if (!user) {
      return []; // No tabs for non-logged-in users
    }

    if (user.role === 'admin') {
      // Admin sees: Dashboard, Books, Members, Borrowings, My Profile
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/books', label: 'Books' },
        { path: '/members', label: 'Members' },
        { path: '/borrowings', label: 'Borrowings' },
        { path: '/profile', label: 'My Profile' },
      ];
    } else {
      // Member sees: Dashboard, Books
      return [
        { path: '/user/dashboard', label: 'Dashboard' },
        { path: '/books', label: 'Books' },
        { path: '/profile', label: 'My Profile' },
      ];
    }
  };

  const tabs = getTabs();

  return (
    <header className="app-header">
      <h1>📚 Neighborhood Library Service</h1>
      {user && tabs.length > 0 && (
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={tab.path === '/'}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
      <div className="header-actions">
        {user ? (
          <>
            <span className="user-info">
              Welcome, {userName || (user.role === 'admin' ? 'Admin' : 'Member')}
            </span>
            {(user.role === 'admin' || user.role === 'member') && (
              <button className="btn-header" onClick={handleLogout}>
                Logout
              </button>
            )}
          </>
        ) : (
          <>
            <button className="btn-header" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-header btn-primary" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

