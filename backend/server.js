require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);       // /api/register  /api/login
app.use('/api/items', itemRoutes); // /api/items/...

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Lost & Found API is running' });
});

// ── MongoDB connection ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
