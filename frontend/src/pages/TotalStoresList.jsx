import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const ListStores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ name: '', ownerEmail: '', address: '', avgRating: '' });

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/stores', {
          headers: {
            'x-user-id': user.id
          }
        });
        const data = await res.json();
        if (res.ok) {
          setStores(data);
        } else {
          setError(data.message || 'Failed to fetch stores');
        }
      } catch (err) {
        setError('Error fetching stores');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStores();
  }, [user]);

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(filter.name.toLowerCase()) &&
    (s.ownerEmail || '').toLowerCase().includes(filter.ownerEmail.toLowerCase()) &&
    (s.address || '').toLowerCase().includes(filter.address.toLowerCase()) &&
    (s.avgRating !== undefined && s.avgRating !== null ? String(s.avgRating).toLowerCase().includes(filter.avgRating.toLowerCase()) : filter.avgRating === '')
  );

  return (
    <div>
      <h3>List of Stores</h3>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Filter by Name"
          value={filter.name}
          onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filter by Owner Email"
          value={filter.ownerEmail}
          onChange={e => setFilter(f => ({ ...f, ownerEmail: e.target.value }))}
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filter by Address"
          value={filter.address}
          onChange={e => setFilter(f => ({ ...f, address: e.target.value }))}
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filter by Avg Rating"
          value={filter.avgRating}
          onChange={e => setFilter(f => ({ ...f, avgRating: e.target.value }))}
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 6 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Store Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Address</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Owner Email</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{s.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{s.address}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{s.ownerEmail || '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{s.avgRating !== undefined ? s.avgRating : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListStores;
