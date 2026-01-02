# Data Persistence in MongoDB

## Overview

This document explains how user profile data, including RIASEC scores, is stored in MongoDB and retrieved when users log in again.

## MongoDB Schema Structure

### User Document

Each user document in MongoDB contains:

```javascript
{
  _id: ObjectId("..."),              // Unique MongoDB ID
  username: "john_doe",              // Unique username
  email: "john@example.com",         // Unique email
  password: "hashed_password",       // Encrypted password
  
  profile: {
    // Original Questionnaire Responses (stored for exact regeneration)
    riasec_responses: {
      r1: 4, r2: 5, r3: 3, ...      // Original RIASEC questionnaire answers
    },
    skill_responses: {
      programming: 4,
      communication: 5,
      ...
    },
    subject_preferences: {
      stem: 4,
      arts: 2,
      ...
    },
    
    // Processed RIASEC Profile Scores
    riasec_profile: {
      R: 0.75,  // Realistic
      I: 0.60,  // Investigative
      A: 0.45,  // Artistic
      S: 0.80,  // Social
      E: 0.55,  // Enterprising
      C: 0.70   // Conventional
    },
    
    // Vector Representations
    riasec_vector: [0.75, 0.60, 0.45, 0.80, 0.55, 0.70],
    skill_vector: [0.5, 0.75, 0.8, ...],
    subject_vector: [0.6, 0.4, 0.3, 0.2],
    combined_vector: [0.75, 0.60, ..., 0.5, 0.75, ..., 0.6, 0.4, ...],
    
    // Processed Skills (1-5 scale)
    skills: {
      programming: 4,
      communication: 5,
      ...
    },
    
    last_updated: ISODate("2024-01-15T10:30:00Z")
  },
  
  cluster: {
    cluster_id: 2,
    cluster_name: "Social-Enterprising"
  },
  
  recommendations: [
    {
      career_id: "teacher",
      title: "Teacher",
      description: "...",
      similarity_score: 0.85,
      domain: "Education",
      salary_range: "$40k - $70k",
      required_skills: ["Communication", "Patience", "Teaching"],
      skill_gaps: {
        "Communication": 0.2,
        "Patience": 0.15
      },
      timestamp: ISODate("2024-01-15T10:30:00Z")
    },
    ...
  ],
  
  createdAt: ISODate("2024-01-10T08:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

## Data Flow

### 1. First Time Submission

```
User Completes Questionnaire
  ↓
POST /api/profile/submit
  ↓
Backend Processes:
  1. Stores original responses (riasec_responses, skill_responses, subject_preferences)
  2. Processes RIASEC scores
  3. Generates vectors
  4. Assigns cluster
  5. Gets recommendations with skill gaps
  6. Generates visualization data
  ↓
Saves to MongoDB:
  - profile.riasec_responses (original)
  - profile.riasec_profile (processed scores)
  - profile.riasec_vector, skill_vector, etc.
  - cluster assignment
  - recommendations array
  ↓
Returns all data to frontend
  ↓
Frontend displays Results page
```

### 2. User Logs In Again

```
User Logs In
  ↓
GET /api/profile/me
  ↓
MongoDB Query:
  - Finds user by _id (from JWT token)
  - Retrieves complete profile document
  ↓
Returns to Frontend:
  - profile.riasec_profile (RIASEC scores)
  - profile.skills (skill assessments)
  - profile.riasec_vector, combined_vector, etc.
  - cluster assignment
  - recommendations with skill_gaps
  ↓
GET /api/profile/visualize
  ↓
Uses saved combined_vector to regenerate visualization
  ↓
Frontend displays exact same Results page
```

## Key Features

### 1. Complete Data Persistence

- **Original Responses**: Stored for exact regeneration
- **Processed Scores**: RIASEC profile scores calculated and stored
- **Vectors**: All vector representations saved
- **Cluster**: Career cluster assignment persisted
- **Recommendations**: All career recommendations with skill gaps saved

### 2. Unique User Identification

- Each user identified by MongoDB `_id` (unique)
- Also indexed by `username` and `email` (both unique)
- JWT token contains `userId` for authentication

### 3. Data Updates

- When user retakes questionnaire, old data is **REPLACED** (not appended)
- `profile.last_updated` timestamp tracks when profile was last modified
- Recommendations array is completely replaced with new ones

### 4. Visualization Regeneration

- Visualization data is **not stored** (too large)
- Instead, it's regenerated from saved `combined_vector`
- This ensures visualization always matches current profile

## MongoDB Indexes

For efficient queries, the following indexes are created:

```javascript
userSchema.index({ _id: 1 });                    // Primary key
userSchema.index({ username: 1 });                // Unique username
userSchema.index({ email: 1 });                  // Unique email
userSchema.index({ 'profile.riasec_profile.R': 1 }); // RIASEC queries
userSchema.index({ 'profile.last_updated': -1 });   // Sort by update time
```

## API Endpoints

### POST /api/profile/submit
- Saves complete profile data to MongoDB
- Stores original responses AND processed data
- Returns all data for immediate display

### GET /api/profile/me
- Retrieves complete profile from MongoDB
- Returns everything needed to recreate UI
- Includes original responses for regeneration

### GET /api/profile/visualize
- Uses saved `combined_vector` from profile
- Regenerates visualization data from ML engine
- Returns visualization data for display

## Testing Data Persistence

To verify data is persisted correctly:

1. **Complete Questionnaire**: Submit as a new user
2. **Check MongoDB**: Verify document has all fields
3. **Log Out**: Clear frontend state
4. **Log In Again**: Use same credentials
5. **Navigate to Results**: Should see exact same data
6. **Verify**: All charts, recommendations, skill gaps should match

## Example MongoDB Query

```javascript
// Find user by ID
db.users.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })

// Find user by username
db.users.findOne({ username: "john_doe" })

// Find users with specific RIASEC score
db.users.find({ "profile.riasec_profile.S": { $gt: 0.7 } })

// Find users updated in last 7 days
db.users.find({ 
  "profile.last_updated": { 
    $gte: new Date(Date.now() - 7*24*60*60*1000) 
  } 
})
```

## Data Integrity

- **Unique Constraints**: Username and email are unique
- **Required Fields**: Username, email, password are required
- **Data Validation**: Mongoose validates data types
- **Timestamps**: Automatic `createdAt` and `updatedAt` tracking
- **Password Hashing**: Passwords are hashed before saving

## Summary

Every unique user's RIASEC scores and complete profile data are stored in MongoDB with their unique ID. When they log in again, all data is retrieved and the exact same UI is displayed as when they first submitted the questionnaire.




