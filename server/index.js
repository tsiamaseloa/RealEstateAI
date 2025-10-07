require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const propertyRoutes = require('./src/routes/propertyRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Mount property routes
app.use('/api/properties', propertyRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Test route to confirm .env variables
app.get('/api/test-env', (req, res) => {
  res.json({
    port: process.env.PORT,
    mongoUri: process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing',
    jwtSecret: process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing'
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

