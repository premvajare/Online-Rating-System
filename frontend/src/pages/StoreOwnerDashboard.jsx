import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';

const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pw, setPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch('http://localhost:5000/stores', {
          headers: { 'x-user-id': user.id }
        });
        const stores = await res.json();
        const ownerStore = stores.find(s => s.ownerId === Number(user.id));
        setStore(ownerStore);
        if (ownerStore) {
          // fetch dashboard info (users who rated, avg rating)
          const dashRes = await fetch('http://localhost:5000/owner/dashboard', {
            headers: { 'x-user-id': user.id }
          });
          const dashData = await dashRes.json();
          setDashboard(dashData);
        }
      } catch (err) {
        setStore(null);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStore();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePwUpdate = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwLoading(true);
    try {
      const res = await fetch('http://localhost:5000/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ password: pw })
      });
      const data = await res.json();
      if (res.ok) setPwMsg('Password updated successfully!');
      else setPwMsg(data.error || 'Failed to update password');
      setPw('');
    } catch {
      setPwMsg('Error updating password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Navbar displayName={store?.name || 'Store'} />
      {/* Removed store name heading, show owner name instead */}
      {loading ? (
        <p>Loading...</p>
      ) : store ? (
        <>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>{user?.name || 'Store Owner'}</h1>
          <p style={{ marginBottom: 24, fontSize: 20 }}>Welcome!</p>
          {/* Average Rating */}
          <div style={{ marginBottom: 24, fontSize: 18 }}>
            <b>Average Store Rating:</b> {dashboard && dashboard.avgRating ? dashboard.avgRating : 'N/A'}
          </div>
          {/* Users who rated table */}
          <div style={{ marginBottom: 32 }}>
            <h3>Users Who Rated Your Store</h3>
            {dashboard && dashboard.users && dashboard.users.length > 0 ? (
              <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>User Name</th>
                      <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Rating</th>
                      <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.users.map((u, idx) => (
                      <tr key={u.id || idx}>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.name}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.email}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.rating || 'N/A'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.feedback || <span style={{ color: '#aaa' }}>No feedback</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#888' }}>No ratings yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>No store found for your account.</p>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;