import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, formData);

      // Persist auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🔍</div>
          <span className="auth-logo-text">Lost &amp; Found</span>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your campus portal</p>

        {/* Alert */}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Signing In…' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
