import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const AddAdminForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (adminName.length < 8 || adminName.length > 60) errs.name = 'Name must be 8-60 characters.';
    if (!/^[\w\s]{8,60}$/.test(adminName)) errs.name = 'Name must be 8-60 characters.';
    if (adminAddress.length > 400) errs.address = 'Address must be at most 400 characters.';
    if (!/^.{8,16}$/.test(adminPassword) || !/[A-Z]/.test(adminPassword) || !/[^A-Za-z0-9]/.test(adminPassword)) errs.password = 'Password must be 8-16 chars, include uppercase & special char.';
    if (!/^\S+@\S+\.\S+$/.test(adminEmail)) errs.email = 'Invalid email format.';
    return errs;
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setAdminMessage('');
    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          address: adminAddress,
          role: 'admin'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminMessage(data.message || 'Failed to create admin');
        return;
      }
      setAdminMessage('Admin created successfully!');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminAddress('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setAdminMessage('Error creating admin');
    }
  };

  return (
    <div className="modern-form">
      <h3>Add New Admin</h3>
      <form onSubmit={handleAddAdmin}>
        <div>
          <label className="modern-label">Name:</label>
          <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required minLength={8} maxLength={60} className="modern-input" />
          {errors.name && <div className="modern-error">{errors.name}</div>}
        </div>
        <div>
          <label className="modern-label">Email:</label>
          <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className="modern-input" />
          {errors.email && <div className="modern-error">{errors.email}</div>}
        </div>
        <div>
          <label className="modern-label">Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showAdminPassword ? 'text' : 'password'}
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              className="modern-input"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowAdminPassword(v => !v)}
              className="modern-toggle-btn"
              tabIndex={-1}
              aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
            >
              {showAdminPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="modern-error">{errors.password}</div>}
        </div>
        <div>
          <label className="modern-label">Address:</label>
          <input type="text" value={adminAddress} onChange={e => setAdminAddress(e.target.value)} required maxLength={400} className="modern-input" />
          {errors.address && <div className="modern-error">{errors.address}</div>}
        </div>
        <button type="submit" className="modern-btn">Add Admin</button>
      </form>
      {adminMessage && <div className={adminMessage.includes('success') ? 'modern-success' : 'modern-error'}>{adminMessage}</div>}
    </div>
  );
};

export default AddAdminForm;
