import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch user details from backend for each role
  const fetchUserDetails = async (userId, role) => {
    let url = null;
    if (role === 'admin') url = `http://localhost:5000/admin/details`;
    else if (role === 'store_owner') url = `http://localhost:5000/store-owner/details`;
    else if (role === 'user') url = `http://localhost:5000/user/details`;
    if (!url) return null;
    try {
      const res = await fetch(url, { headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (res.ok && data) return data;
    } catch {}
    return null;
  };

  useEffect(() => {
    // Load user from localStorage on mount
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (userId && role) {
      fetchUserDetails(userId, role).then(details => {
        if (details) {
          setUser({
            id: details.id,
            name: details.name,
            email: details.email,
            role: details.role,
            address: details.address
          });
          localStorage.setItem('userName', details.name);
          localStorage.setItem('userEmail', details.email);
        } else {
          setUser({ id: userId, role });
        }
      });
    }
  }, []);

  const login = async (user) => {
    // Fetch full user details after login
    const details = await fetchUserDetails(user.id, user.role);
    const fullUser = details
      ? { id: details.id, name: details.name, email: details.email, role: details.role, address: details.address }
      : user;
    localStorage.setItem('userId', fullUser.id);
    localStorage.setItem('role', fullUser.role);
    localStorage.setItem('userName', fullUser.name || '');
    localStorage.setItem('userEmail', fullUser.email || '');
    setUser(fullUser);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
