import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/stores', {
          headers: {
            'x-user-id': user.id
          }
        });
        const data = await res.json();
        setStores(data);
      } catch (err) {
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRateClick = (store) => {
    setSelectedStore(store);
    setShowModal(true);
    setRating(0);
    setFeedback('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedStore(null);
    setRating(0);
    setFeedback('');
  };

  const handleSubmitRating = async () => {
    if (!rating || !selectedStore) return;
    setSubmitting(true);
    try {
      await fetch('http://localhost:5000/user/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ storeId: selectedStore.id, rating, feedback })
      });
      // Refresh store list to update average ratings
      const res = await fetch('http://localhost:5000/user/stores', {
        headers: {
          'x-user-id': user.id
        }
      });
      const data = await res.json();
      setStores(data);
      handleModalClose();
    } catch (err) {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    (store.address && store.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Navbar displayName={user?.name || 'User'} />
      <h2>User Dashboard</h2>
      <input
        type="text"
        placeholder="Search stores by name or address..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 24, fontSize: 16 }}
      />
      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 12, border: '1px solid #ddd' }}>Store Name</th>
              <th style={{ padding: 12, border: '1px solid #ddd' }}>Address</th>
              <th style={{ padding: 12, border: '1px solid #ddd' }}>Overall Rating</th>
              <th style={{ padding: 12, border: '1px solid #ddd' }}>Your Rating</th>
              <th style={{ padding: 12, border: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No stores found.</td></tr>
            ) : filteredStores.map(store => (
              <tr key={store.id}>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{store.name}</td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{store.address}</td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{store.avgRating ? store.avgRating : 'N/A'}</td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{store.ownRating ? store.ownRating : <span style={{ color: '#aaa' }}>Not rated</span>}</td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>
                  <button
                    style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => handleRateClick(store)}
                  >
                    {store.ownRating ? 'Edit' : 'Rate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Rating Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320 }}>
            <h3>{selectedStore.ownRating ? 'Edit Your Rating' : 'Rate'} {selectedStore.name}</h3>
            <div style={{ margin: '16px 0' }}>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  style={{
                    fontSize: 28,
                    color: star <= (rating || selectedStore.ownRating) ? '#ffb400' : '#ccc',
                    cursor: 'pointer',
                    marginRight: 4
                  }}
                  onClick={() => setRating(star)}
                >★</span>
              ))}
            </div>
            <textarea
              placeholder="Write your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: 16, padding: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={handleModalClose} style={{ padding: '8px 16px', border: 'none', background: '#ccc', borderRadius: 4 }}>Cancel</button>
              <button
                onClick={handleSubmitRating}
                style={{ padding: '8px 16px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: 4 }}
                disabled={submitting || !(rating || selectedStore.ownRating)}
              >
                {submitting ? 'Submitting...' : (selectedStore.ownRating ? 'Update' : 'Submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;