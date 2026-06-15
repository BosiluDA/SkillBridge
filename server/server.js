const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// ── ROUTES ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/exchanges', require('./routes/exchanges'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/messages',  require('./routes/messages'));
app.use('/api/admin',     require('./routes/admin'));

// ── HEALTH CHECK ──
app.get('/', (req, res) => {
  res.json({
    message: '✅ SkillBridge API is running',
    version: '1.0.0',
    endpoints: {
      auth:      '/api/auth',
      users:     '/api/users',
      exchanges: '/api/exchanges',
      reviews:   '/api/reviews',
      messages:  '/api/messages',
      admin:     '/api/admin'
    }
  });
});

// ── CONNECT TO MONGODB ──
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
