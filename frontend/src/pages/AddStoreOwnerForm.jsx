import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const AddStoreOwnerForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (ownerName.length < 8 || ownerName.length > 60) errs.ownerName = 'Owner name must be 8-60 characters.';
    if (!/^[\w\s]{8,60}$/.test(ownerName)) errs.ownerName = 'Owner name must be 8-60 characters.';
    if (ownerAddress.length > 400) errs.ownerAddress = 'Owner address must be at most 400 characters.';
    if (!/^.{8,16}$/.test(ownerPassword) || !/[A-Z]/.test(ownerPassword) || !/[^A-Za-z0-9]/.test(ownerPassword)) errs.ownerPassword = 'Password must be 8-16 chars, include uppercase & special char.';
    if (!/^\S+@\S+\.\S+$/.test(ownerEmail)) errs.ownerEmail = 'Invalid email format.';
    if (storeName.length < 1) errs.storeName = 'Store name is required.';
    if (storeAddress.length > 400) errs.storeAddress = 'Store address must be at most 400 characters.';
    return errs;
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setMessage('');
    try {
      const userRes = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          password: ownerPassword,
          address: ownerAddress,
          role: 'store_owner'
        })
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setMessage(userData.message || 'Failed to create store owner');
        return;
      }
      const ownerId = userData.user.id;
      const storeRes = await fetch('http://localhost:5000/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: storeName,
          address: storeAddress,
          ownerId
        })
      });
      const storeData = await storeRes.json();
      if (!storeRes.ok) {
        setMessage(storeData.message || 'Failed to create store');
        return;
      }
      setMessage('Store and store owner created successfully!');
      setStoreName('');
      setStoreAddress('');
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setOwnerAddress('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage('Error creating store and owner');
    }
  };

  return (
    <div className="modern-form">
      <h3>Add Store & Store Owner</h3>
      <form onSubmit={handleAddStore}>
        <div>
          <label className="modern-label">Store Name:</label>
          <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} required className="modern-input" />
          {errors.storeName && <div className="modern-error">{errors.storeName}</div>}
        </div>
        <div>
          <label className="modern-label">Store Address:</label>
          <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} required maxLength={400} className="modern-input" />
          {errors.storeAddress && <div className="modern-error">{errors.storeAddress}</div>}
        </div>
        <div>
          <label className="modern-label">Owner Name:</label>
          <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} required minLength={8} maxLength={60} className="modern-input" />
          {errors.ownerName && <div className="modern-error">{errors.ownerName}</div>}
        </div>
        <div>
          <label className="modern-label">Owner Email:</label>
          <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required className="modern-input" />
          {errors.ownerEmail && <div className="modern-error">{errors.ownerEmail}</div>}
        </div>
        <div>
          <label className="modern-label">Owner Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showOwnerPassword ? 'text' : 'password'}
              value={ownerPassword}
              onChange={e => setOwnerPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              className="modern-input"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowOwnerPassword(v => !v)}
              className="modern-toggle-btn"
              tabIndex={-1}
              aria-label={showOwnerPassword ? 'Hide password' : 'Show password'}
            >
              {showOwnerPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.ownerPassword && <div className="modern-error">{errors.ownerPassword}</div>}
        </div>
        <div>
          <label className="modern-label">Owner Address:</label>
          <input type="text" value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} required maxLength={400} className="modern-input" />
          {errors.ownerAddress && <div className="modern-error">{errors.ownerAddress}</div>}
        </div>
        <button type="submit" className="modern-btn">Add Store & Owner</button>
      </form>
      {message && <div className={message.includes('success') ? 'modern-success' : 'modern-error'}>{message}</div>}
    </div>
  );
};

export default AddStoreOwnerForm;
