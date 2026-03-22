import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { api, getApiErrorMessage } from '../lib/api';
import { getAdminToken, setAdminSession } from '../utils/adminAuth';
import { SITE_NAME } from '../constants/site';

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (getAdminToken()) {
      navigate('/admin/panel', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        identifier: identifier.trim(),
        password
      });

      setAdminSession(response.data);
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <Link to="/" className="text-3xl font-bold text-white">
              {SITE_NAME}
            </Link>
            <h1 className="mt-6 text-3xl font-extrabold text-white">Admin Portal</h1>
            <p className="mt-2 text-sm text-slate-300">
              Sign in with your admin username or email to manage enquiries.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Username or Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-white outline-none transition focus:border-emerald-500"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-white outline-none transition focus:border-emerald-500"
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
