import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import AddStoreOwnerForm from './AddStoreOwnerForm.jsx';
import AddAdminForm from './AddAdminForm.jsx';
import AddUserForm from './AddUserForm.jsx';
import ListUsers from './TotalUsersList.jsx';
import ListStores from './TotalStoresList.jsx';
import Navbar from './Navbar.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch total users and stores for Home view
  useEffect(() => {
    if (selectedMenu === 'home' || selectedMenu === '') {
      const fetchCounts = async () => {
        try {
          // Fetch users
          const userRes = await fetch('http://localhost:5000/users', {
            headers: { 'x-user-id': user.id }
          });
          const userData = await userRes.json();
          if (userRes.ok) {
            setTotalUsers(userData.length);
          }
          // Fetch stores
          const storeRes = await fetch('http://localhost:5000/stores', {
            headers: { 'x-user-id': user.id }
          });
          const storeData = await storeRes.json();
          if (storeRes.ok) {
            setTotalStores(storeData.length);
          }
          // Fetch ratings
          const ratingsRes = await fetch('http://localhost:5000/admin/stats', {
            headers: { 'x-user-id': user.id }
          });
          const ratingsData = await ratingsRes.json();
          if (ratingsRes.ok && typeof ratingsData.totalRatings === 'number') {
            setTotalRatings(ratingsData.totalRatings);
          }
        } catch {
          setTotalUsers(0);
          setTotalStores(0);
          setTotalRatings(0);
        }
      };
      if (user) fetchCounts();
    }
  }, [selectedMenu, user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        background: '#222',
        color: '#fff',
        transition: 'width 0.3s',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1000,
        boxShadow: sidebarOpen ? '2px 0 8px rgba(0,0,0,0.15)' : 'none'
      }}>
        {sidebarOpen && (
          <>
            <div style={{ padding: 24, borderBottom: '1px solid #444', fontWeight: 'bold', fontSize: 20 }}>
              Admin Menu
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'home' || selectedMenu === '' ? '#444' : 'none' }} onClick={() => setSelectedMenu('home')}>Home</li>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'addStoreOwner' ? '#444' : 'none' }} onClick={() => setSelectedMenu('addStoreOwner')}>Add Store & Store Owner</li>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'addAdmin' ? '#444' : 'none' }} onClick={() => setSelectedMenu('addAdmin')}>Add New Admin</li>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'addUser' ? '#444' : 'none' }} onClick={() => setSelectedMenu('addUser')}>Add User</li>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'listUsers' ? '#444' : 'none' }} onClick={() => setSelectedMenu('listUsers')}>List of Users</li>
              <li style={{ padding: '16px 24px', cursor: 'pointer', background: selectedMenu === 'listStores' ? '#444' : 'none' }} onClick={() => setSelectedMenu('listStores')}>List of Stores</li>
            </ul>
          </>
        )}
      </div>
      {/* Hamburger Icon */}
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1100 }}>
        <button onClick={() => setSidebarOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 28, height: 4, background: '#222', margin: '3px 0', borderRadius: 2 }}></div>
            <div style={{ width: 28, height: 4, background: '#222', margin: '3px 0', borderRadius: 2 }}></div>
            <div style={{ width: 28, height: 4, background: '#222', margin: '3px 0', borderRadius: 2 }}></div>
          </div>
        </button>
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: 'margin-left 0.3s', padding: 32, width: '100%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
          <Navbar displayName={user?.name || 'Admin'} />
          {(selectedMenu === 'home' || selectedMenu === '') && (
            <>
              <h2>Admin Dashboard</h2>
              <p>Welcome, {user ? user.role : 'Admin'}!</p>
              <p>Manage users and stores here.</p>
              <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '32px 48px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', fontSize: 22, fontWeight: 600, minWidth: 220, textAlign: 'center' }}>
                  Total Users (including Admin):<br />
                  <span style={{ fontSize: 36, color: '#007bff' }}>{totalUsers}</span>
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '32px 48px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', fontSize: 22, fontWeight: 600, minWidth: 220, textAlign: 'center' }}>
                  Total Stores:<br />
                  <span style={{ fontSize: 36, color: '#28a745' }}>{totalStores}</span>
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '32px 48px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', fontSize: 22, fontWeight: 600, minWidth: 220, textAlign: 'center' }}>
                  Total Ratings:<br />
                  <span style={{ fontSize: 36, color: '#ff9800' }}>{totalRatings}</span>
                </div>
              </div>
            </>
          )}
          {selectedMenu === 'addStoreOwner' && <AddStoreOwnerForm />}
          {selectedMenu === 'addAdmin' && <AddAdminForm />}
          {selectedMenu === 'addUser' && <AddUserForm />}
          {selectedMenu === 'listUsers' && <ListUsers />}
          {selectedMenu === 'listStores' && <ListStores />}
          {/* By default, show nothing for other menu items for now */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;