const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { sequelize, User, Store, Rating } = require('./models');
const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Remove JWT and use simple session-based authentication
let currentSession = {};

// Authentication middleware (checks if user is logged in via session)
const authenticateSession = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId || !currentSession[userId]) {
    return res.status(401).send('Access Denied');
  }
  req.user = currentSession[userId];
  next();
};

// Role-based access middleware
const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send('Access Denied');
  }
  next();
};

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/signup', async (req, res) => {
  const { name, email, password, role, address } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role, address });

    res.status(201).send({ message: 'User created successfully', user });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Email already in use' });
    }

    res.status(500).send({
      message: err.errors?.[0]?.message || 'Error creating user',
    });
  }
});


// Login route (no JWT, just session)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    // Set session
    currentSession[user.id] = { id: user.id, role: user.role, email: user.email };
    res.send({ message: 'Login successful', user: { id: user.id, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).send({ error: 'Error logging in', details: err });
  }
});

app.get('/admin-dashboard', authenticateSession, authorizeRole(['admin']), (req, res) => {
  res.send('Welcome to the Admin Dashboard');
});

// Routes for managing users
app.get('/users', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll();
    // Get all store owners
    const storeOwners = users.filter(u => u.role === 'store_owner');
    // Get all stores owned by store owners
    const ownerIds = storeOwners.map(u => u.id);
    const stores = await Store.findAll({ where: { ownerId: ownerIds } });
    // Get all ratings for those stores
    const storeIds = stores.map(s => s.id);
    const ratings = await Rating.findAll({ where: { storeId: storeIds } });
    // Calculate avg rating for each owner
    const ownerAvgRating = {};
    ownerIds.forEach(ownerId => {
      const ownerStoreIds = stores.filter(s => s.ownerId === ownerId).map(s => s.id);
      const ownerRatings = ratings.filter(r => ownerStoreIds.includes(r.storeId));
      if (ownerRatings.length > 0) {
        ownerAvgRating[ownerId] = (ownerRatings.reduce((a, b) => a + b.rating, 0) / ownerRatings.length).toFixed(2);
      } else {
        ownerAvgRating[ownerId] = '-';
      }
    });
    // Attach avgRating to each user if store_owner
    const usersWithRating = users.map(u =>
      u.role === 'store_owner' ? { ...u.toJSON(), avgRating: ownerAvgRating[u.id] } : { ...u.toJSON() }
    );
    res.send(usersWithRating);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching users', details: err });
  }
});

// Routes for managing stores
app.post('/stores', authenticateSession, authorizeRole(['admin', 'store_owner']), async (req, res) => {
  const { name, address, ownerId } = req.body;
  if (!name || !address || !ownerId) {
    return res.status(400).send('All fields are required');
  }

  try {
    const store = await Store.create({ name, address, ownerId });
    res.status(201).send({ message: 'Store created successfully', store });
  } catch (err) {
    res.status(500).send({ error: 'Error creating store', details: err });
  }
});

app.get('/stores', authenticateSession, async (req, res) => {
  try {
    const stores = await Store.findAll();
    // Fetch all owners in one go
    const ownerIds = stores.map(s => s.ownerId);
    const owners = await User.findAll({ where: { id: ownerIds } });
    const ownerMap = {};
    owners.forEach(o => { ownerMap[o.id] = o.email; });
    // Fetch all ratings in one go
    const storeIds = stores.map(s => s.id);
    const ratings = await Rating.findAll({ where: { storeId: storeIds } });
    // Calculate avg rating for each store
    const avgRatingMap = {};
    storeIds.forEach(id => {
      const storeRatings = ratings.filter(r => r.storeId === id);
      if (storeRatings.length > 0) {
        avgRatingMap[id] = (storeRatings.reduce((a, b) => a + b.rating, 0) / storeRatings.length).toFixed(2);
      } else {
        avgRatingMap[id] = null;
      }
    });
    // Attach ownerEmail and avgRating to each store
    const storeData = stores.map(store => ({
      ...store.toJSON(),
      ownerEmail: ownerMap[store.ownerId] || '-',
      avgRating: avgRatingMap[store.id]
    }));
    res.send(storeData);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching stores', details: err });
  }
});

// Routes for managing ratings
app.post('/ratings', authenticateSession, authorizeRole(['user']), async (req, res) => {
  const { storeId, rating } = req.body;
  if (!storeId || !rating) {
    return res.status(400).send('All fields are required');
  }

  try {
    const newRating = await Rating.create({ userId: req.user.id, storeId, rating });
    res.status(201).send({ message: 'Rating submitted successfully', newRating });
  } catch (err) {
    res.status(500).send({ error: 'Error submitting rating', details: err });
  }
});

app.get('/ratings/:storeId', authenticateSession, async (req, res) => {
  const { storeId } = req.params;
  try {
    const ratings = await Rating.findAll({ where: { storeId } });
    res.send(ratings);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching ratings', details: err });
  }
});

// Admin: Get stats
app.get('/admin/stats', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err });
  }
});

// Admin: List/filter/sort users
app.get('/admin/users', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC', role } = req.query;
  let where = {};
  if (search) {
    where = {
      ...where,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ]
    };
  }
  if (role) where.role = role;
  try {
    const users = await User.findAll({ where, order: [[sortBy, order]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err });
  }
});

// Admin: List/filter/sort stores
app.get('/admin/stores', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC' } = req.query;
  let where = {};
  if (search) {
    where = {
      ...where,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ]
    };
  }
  try {
    const stores = await Store.findAll({ where, order: [[sortBy, order]] });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores', details: err });
  }
});

// Admin: Get detailed user info
app.get('/admin/user/:id', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let ratings = [];
    if (user.role === 'store_owner') {
      const stores = await Store.findAll({ where: { ownerId: user.id } });
      const storeIds = stores.map(s => s.id);
      ratings = await Rating.findAll({ where: { storeId: storeIds } });
    }
    res.json({ user, ratings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info', details: err });
  }
});

// Get admin details
app.get('/admin/details', authenticateSession, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Admin not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin details', details: err });
  }
});

// Get store owner details
app.get('/store-owner/details', authenticateSession, authorizeRole(['store_owner']), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Store owner not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store owner details', details: err });
  }
});

// Get user details
app.get('/user/details', authenticateSession, authorizeRole(['user']), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details', details: err });
  }
});

// User: Update password
app.put('/user/password', authenticateSession, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.update({ password: hashed }, { where: { id: req.user.id } });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password', details: err });
  }
});

// User: Update address
app.put('/user/address', authenticateSession, async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });
  try {
    await User.update({ address }, { where: { id: req.user.id } });
    res.json({ message: 'Address updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address', details: err });
  }
});

// User: Submit or update rating
app.post('/user/rate', authenticateSession, authorizeRole(['user']), async (req, res) => {
  const { storeId, rating, feedback } = req.body;
  if (!storeId || !rating) return res.status(400).json({ error: 'storeId and rating required' });
  try {
    let userRating = await Rating.findOne({ where: { userId: req.user.id, storeId } });
    if (userRating) {
      userRating.rating = rating;
      userRating.feedback = feedback;
      await userRating.save();
      return res.json({ message: 'Rating updated', rating: userRating });
    } else {
      userRating = await Rating.create({ userId: req.user.id, storeId, rating, feedback });
      return res.json({ message: 'Rating submitted', rating: userRating });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit/update rating', details: err });
  }
});

// User: List/search/sort stores with avg/own rating
app.get('/user/stores', authenticateSession, authorizeRole(['user']), async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC' } = req.query;
  let where = {};
  if (search) {
    where = {
      ...where,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ]
    };
  }
  try {
    const stores = await Store.findAll({ where, order: [[sortBy, order]] });
    const storeIds = stores.map(s => s.id);
    const ratings = await Rating.findAll({ where: { storeId: storeIds } });
    const userRatings = await Rating.findAll({ where: { userId: req.user.id, storeId: storeIds } });
    const storeData = stores.map(store => {
      const storeRatings = ratings.filter(r => r.storeId === store.id);
      const avgRating = storeRatings.length ? (storeRatings.reduce((a, b) => a + b.rating, 0) / storeRatings.length).toFixed(2) : null;
      const ownRating = userRatings.find(r => r.storeId === store.id)?.rating || null;
      return { ...store.toJSON(), avgRating, ownRating };
    });
    res.json(storeData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores', details: err });
  }
});

// Store Owner: Dashboard (users who rated, avg rating)
app.get('/owner/dashboard', authenticateSession, authorizeRole(['store_owner']), async (req, res) => {
  try {
    const stores = await Store.findAll({ where: { ownerId: req.user.id } });
    const storeIds = stores.map(s => s.id);
    const ratings = await Rating.findAll({ where: { storeId: storeIds } });
    const userIds = ratings.map(r => r.userId);
    const users = await User.findAll({ where: { id: userIds } });
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(2) : null;
    // Attach rating and feedback to each user
    const usersWithRatings = users.map(u => {
      const userRating = ratings.find(r => r.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        rating: userRating ? userRating.rating : null,
        feedback: userRating ? userRating.feedback : null
      };
    });
    res.json({ users: usersWithRatings, avgRating });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err });
  }
});

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

// Database connection
sequelize.sync().then(async () => {
  console.log('Database connected and tables created');
  // Insert default admin if not exists
  const admin = await User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await User.create({
      name: 'System Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Default admin user created:', DEFAULT_ADMIN_EMAIL);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Database connection failed:', err));