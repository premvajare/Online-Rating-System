import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const AddUserForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (userName.length < 8 || userName.length > 60) errs.name = 'Name must be 8-60 characters.';
    if (!/^[\w\s]{8,60}$/.test(userName)) errs.name = 'Name must be 8-60 characters.';
    if (userAddress.length > 400) errs.address = 'Address must be at most 400 characters.';
    if (!/^.{8,16}$/.test(userPassword) || !/[A-Z]/.test(userPassword) || !/[^A-Za-z0-9]/.test(userPassword)) errs.password = 'Password must be 8-16 chars, include uppercase & special char.';
    if (!/^\S+@\S+\.\S+$/.test(userEmail)) errs.email = 'Invalid email format.';
    return errs;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setUserMessage('');
    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          address: userAddress,
          role: 'user'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setUserMessage(data.message || 'Failed to create user');
        return;
      }
      setUserMessage('User created successfully!');
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserAddress('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setUserMessage('Error creating user');
    }
  };

  return (
    <div className="modern-form">
      <h3>Add New User</h3>
      <form onSubmit={handleAddUser}>
        <div>
          <label className="modern-label">Name:</label>
          <input type="text" value={userName} onChange={e => setUserName(e.target.value)} required minLength={8} maxLength={60} className="modern-input" />
          {errors.name && <div className="modern-error">{errors.name}</div>}
        </div>
        <div>
          <label className="modern-label">Email:</label>
          <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} required className="modern-input" />
          {errors.email && <div className="modern-error">{errors.email}</div>}
        </div>
        <div>
          <label className="modern-label">Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showUserPassword ? 'text' : 'password'}
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              className="modern-input"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowUserPassword(v => !v)}
              className="modern-toggle-btn"
              tabIndex={-1}
              aria-label={showUserPassword ? 'Hide password' : 'Show password'}
            >
              {showUserPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="modern-error">{errors.password}</div>}
        </div>
        <div>
          <label className="modern-label">Address:</label>
          <input type="text" value={userAddress} onChange={e => setUserAddress(e.target.value)} required maxLength={400} className="modern-input" />
          {errors.address && <div className="modern-error">{errors.address}</div>}
        </div>
        <button type="submit" className="modern-btn">Add User</button>
      </form>
      {userMessage && <div className={userMessage.includes('success') ? 'modern-success' : 'modern-error'}>{userMessage}</div>}
    </div>
  );
};

export default AddUserForm;
