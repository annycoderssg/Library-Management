import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // If not authenticated, redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the protected component
    return children;
}

export default ProtectedRoute;

