import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly) {
        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                return <Navigate to="/user/dashboard" replace />;
            }
        } catch {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;

