import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const [pw, setPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState('');
  const navigate = useNavigate();

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

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setAddressMsg('');
    try {
      const res = await fetch('http://localhost:5000/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (res.ok) {
        setAddressMsg('Address updated successfully!');
        setEditingAddress(false);
        user.address = address; // update local user object
      } else {
        setAddressMsg(data.error || 'Failed to update address');
      }
    } catch {
      setAddressMsg('Error updating address');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Profile</h2>
      <div style={{ marginBottom: 18 }}><b>Name:</b> {user.name}</div>
      <div style={{ marginBottom: 18 }}><b>Email:</b> {user.email}</div>
      <div style={{ marginBottom: 18 }}><b>Role:</b> {user.role}</div>
      <div style={{ marginBottom: 18 }}>
        <b>Address:</b> {editingAddress ? (
          <form onSubmit={handleAddressUpdate} style={{ display: 'inline' }}>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 14, marginRight: 8 }}
            />
            <button type="submit" style={{ padding: '4px 10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14 }}>Save</button>
            <button type="button" onClick={() => setEditingAddress(false)} style={{ marginLeft: 6, padding: '4px 10px', background: '#eee', border: 'none', borderRadius: 4, fontSize: 14 }}>Cancel</button>
          </form>
        ) : (
          <>
            {user.address || address}
            <button onClick={() => setEditingAddress(true)} style={{ marginLeft: 8, padding: '4px 10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14 }}>Edit</button>
          </>
        )}
        {addressMsg && <span style={{ marginLeft: 10, color: addressMsg.includes('success') ? 'green' : 'red' }}>{addressMsg}</span>}
      </div>
      <hr style={{ margin: '24px 0' }} />
      <h3>Update Password</h3>
      <form onSubmit={handlePwUpdate}>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="New password"
          required
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, marginBottom: 12 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: 'pointer' }} disabled={pwLoading}>
          {pwLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
      {pwMsg && <div style={{ marginTop: 10, color: pwMsg.includes('success') ? 'green' : 'red' }}>{pwMsg}</div>}
      <button onClick={() => navigate(-1)} style={{ marginTop: 24, width: '100%', padding: 10, background: '#eee', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}>Back</button>
    </div>
  );
};

export default Profile;
