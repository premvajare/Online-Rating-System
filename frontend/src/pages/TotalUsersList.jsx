import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const ListUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ name: '', email: '', address: '', role: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/users', {
          headers: {
            'x-user-id': user.id
          }
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filter.name.toLowerCase()) &&
    u.email.toLowerCase().includes(filter.email.toLowerCase()) &&
    (u.address || '').toLowerCase().includes(filter.address.toLowerCase()) &&
    u.role.toLowerCase().includes(filter.role.toLowerCase())
  );

  return (
    <div>
      <h3>List of Users</h3>
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
          placeholder="Filter by Email"
          value={filter.email}
          onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
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
          placeholder="Filter by Role"
          value={filter.role}
          onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
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
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Full Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Address</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Role</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd', textAlign: 'left' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.email}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.address || '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.role}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {u.role === 'store_owner' ? (u.avgRating !== undefined ? u.avgRating : '-') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListUsers;
