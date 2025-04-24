import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ displayName }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1976d2', color: '#fff', padding: '16px 32px', borderRadius: 8, marginBottom: 32 }}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{displayName}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={() => navigate('/profile')} style={{ background: '#fff', color: '#1976d2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Profile</button>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ background: '#fff', color: '#1976d2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
