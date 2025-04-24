import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (name.length < 8 || name.length > 60) errs.name = 'Name must be 8-60 characters.';
    if (!/^[\w\s]{8,60}$/.test(name)) errs.name = 'Name must be 8-60 characters.';
    if (address.length > 400) errs.address = 'Address must be at most 400 characters.';
    if (!/^.{8,16}$/.test(password) || !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) errs.password = 'Password must be 8-16 chars, include uppercase & special char.';
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Invalid email format.';
    return errs;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, address })
      });
      const data = await response.json();
      if (response.ok) {
        // Automatically log in the user after signup
        const loginRes = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('userId', loginData.user.id);
          localStorage.setItem('role', loginData.user.role);
          if (loginData.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (loginData.user.role === 'store_owner') {
            navigate('/store-owner-dashboard');
          } else {
            navigate('/user-dashboard');
          }
        } else {
          alert('Signup succeeded, but login failed. Please try logging in.');
          navigate('/login');
        }
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
      <div style={{ background: '#fff', padding: 36, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', minWidth: 350, maxWidth: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1976d2' }}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={20}
              maxLength={60}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            />
            {errors.name && <div style={{ color: 'red', fontSize: 13 }}>{errors.name}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            />
            {errors.email && <div style={{ color: 'red', fontSize: 13 }}>{errors.email}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              autoComplete="current-password"
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            />
            {errors.password && <div style={{ color: 'red', fontSize: 13 }}>{errors.password}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              maxLength={400}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            />
            {errors.address && <div style={{ color: 'red', fontSize: 13 }}>{errors.address}</div>}
          </div>
          {/* Removed Role selection dropdown, only user signup allowed */}
          <button
            type="submit"
            style={{ width: '100%', padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 18, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}
          >
            Sign Up
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ color: '#555' }}>Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer', marginLeft: 6, textDecoration: 'underline', fontWeight: 500 }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;