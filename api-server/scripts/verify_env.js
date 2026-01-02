/**
 * Verify environment variables are loaded
 * Run: node verify_env.js
 */

require('dotenv').config();

console.log('Environment Variables Check:');
console.log('============================');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (' + process.env.JWT_SECRET.length + ' chars)' : 'NOT SET - THIS WILL CAUSE ERRORS!');
console.log('ML_ENGINE_URL:', process.env.ML_ENGINE_URL || 'NOT SET');
console.log('============================');

if (!process.env.JWT_SECRET) {
  console.error('\n❌ ERROR: JWT_SECRET is not set!');
  console.error('Please create a .env file with JWT_SECRET');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}

