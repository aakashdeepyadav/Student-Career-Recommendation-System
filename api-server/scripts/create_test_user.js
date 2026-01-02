/**
 * Create a test user for development
 * Run: node scripts/create_test_user.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scrs';

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@scrs.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@scrs.com');
      console.log('Password: test123');
      await mongoose.connection.close();
      return;
    }

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@scrs.com',
      password: 'test123'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('Email: test@scrs.com');
    console.log('Password: test123');
    console.log('');
    console.log('You can now login with these credentials.');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();


