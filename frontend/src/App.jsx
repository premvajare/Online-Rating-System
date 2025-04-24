import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import Signup from './pages/Signup';
import ProtectedRoute from './ProtectedRoute';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/store-owner/*" element={<ProtectedRoute role="store_owner"><StoreOwnerDashboard /></ProtectedRoute>} />
        <Route path="/store-owner-dashboard/*" element={<ProtectedRoute role="store_owner"><StoreOwnerDashboard /></ProtectedRoute>} />
        <Route path="/user/*" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user-dashboard/*" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="admin"><Profile /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;