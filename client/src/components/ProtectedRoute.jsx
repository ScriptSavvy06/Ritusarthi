import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, buildAuthHeaders } from '../lib/api';
import { clearAdminSession, getAdminToken } from '../utils/adminAuth';

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState(() =>
    getAdminToken() ? 'checking' : 'unauthorized'
  );

  useEffect(() => {
    let isMounted = true;
    const token = getAdminToken();

    if (!token) {
      setAuthState('unauthorized');
      return undefined;
    }

    const verifySession = async () => {
      try {
        await api.get('/api/auth/me', {
          headers: buildAuthHeaders(token)
        });

        if (isMounted) {
          setAuthState('authorized');
        }
      } catch (error) {
        clearAdminSession();

        if (isMounted) {
          setAuthState('unauthorized');
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p className="text-sm text-slate-300">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
