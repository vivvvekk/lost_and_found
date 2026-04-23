require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('==> server.js starting...');
console.log('==> MONGO_URI present:', !!process.env.MONGO_URI);
console.log('==> JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('==> PORT:', process.env.PORT);
console.log('==> Loading routes...');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

console.log('==> Routes loaded OK');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Lost & Found API is running' });
});

// ── MongoDB connection ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

console.log('==> Attempting MongoDB connection...');

// Handle uncaught promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('==> Unhandled Rejection:', reason);
  process.exit(1);
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('==> MongoDB connected successfully!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`==> Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('==> MongoDB connection FAILED:', err.message);
    console.error('==> Full error:', err);
    process.exit(1);
  });
