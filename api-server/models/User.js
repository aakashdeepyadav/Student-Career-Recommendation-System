const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for MongoDB
 * 
 * This schema stores complete user profile data including:
 * - Unique user identification (username, email, _id)
 * - Original questionnaire responses (for exact regeneration)
 * - Processed RIASEC scores and vectors
 * - Career cluster assignment
 * - Career recommendations with skill gaps
 * 
 * When a user logs in again, all this data is retrieved to show
 * the exact same results as when they first submitted the questionnaire.
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null // Path to profile image file (e.g., /uploads/profile-images/userId-timestamp.jpg)
  },
  userInfo: {
    fullName: String,
    bio: String,
    phone: String,
    location: String,
    occupation: String,
    interests: String
  },
  profile: {
    // Original questionnaire responses (stored for exact regeneration)
    riasec_responses: mongoose.Schema.Types.Mixed, // Original RIASEC questionnaire responses
    skill_responses: mongoose.Schema.Types.Mixed, // Original skill assessment responses
    subject_preferences: mongoose.Schema.Types.Mixed, // Original subject preference responses
    
    // Processed RIASEC profile scores
    riasec_profile: {
      R: Number,
      I: Number,
      A: Number,
      S: Number,
      E: Number,
      C: Number
    },
    // Vector representations
    riasec_vector: [Number],
    skill_vector: [Number],
    subject_vector: [Number],
    combined_vector: [Number],
    skills: mongoose.Schema.Types.Mixed, // Processed skills (1-5 scale)
    last_updated: { type: Date, default: Date.now } // Track when profile was last updated
  },
  recommendations: [{
    career_id: String,
    title: String,
    description: String,
    similarity_score: Number,
    domain: String,
    salary_range: String,
    required_skills: [String],
    skill_gaps: mongoose.Schema.Types.Mixed, // Dictionary of skill_name -> gap_value
    timestamp: Date
  }],
  cluster: {
    cluster_id: Number,
    cluster_name: String
  },
  visualization: {
    // Store visualization data to avoid regenerating on every login
    user_2d: [Number], // User's 2D coordinates
    user_3d: [Number], // User's 3D coordinates
    careers_2d: [[Number]], // All careers' 2D coordinates
    careers_3d: [[Number]], // All careers' 3D coordinates
    career_titles: [String], // Career titles in order
    recommended_career_indices: [Number], // Indices of recommended careers (CRITICAL for highlighting)
    clusters_2d: [[Number]], // Cluster centers 2D
    clusters_3d: [[Number]], // Cluster centers 3D
    students_2d: [[Number]], // Student data points 2D
    students_3d: [[Number]], // Student data points 3D
    student_clusters: [Number], // Cluster assignments for students
    last_generated: { type: Date, default: Date.now } // When visualization was generated
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
// Note: _id index is automatically created by MongoDB, don't specify it
// Note: username and email indexes are automatically created by unique: true, don't duplicate them
userSchema.index({ 'profile.riasec_profile.R': 1 }); // Index for RIASEC queries
userSchema.index({ 'profile.last_updated': -1 }); // Index for sorting by update time

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

