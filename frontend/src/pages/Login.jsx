import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'store_owner') navigate('/store-owner-dashboard');
      else navigate('/user-dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    console.log('Login button clicked:', { email, password });
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok) {
        const user = data.user || data;
        login(user);
        navigate('/user-dashboard');
        return;
      } else {
        setLoginError(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      setLoginError('Error logging in. Please try again.');
      console.error('Error logging in:', error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 10, color: '#6366f1', fontWeight: 700, fontSize: '1.6rem' }}>Welcome to Rating System</h1>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
          Login
        </button>
      </form>
      {loginError && <div style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{loginError}</div>}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button type="button" onClick={() => navigate('/signup')} style={{ background: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;