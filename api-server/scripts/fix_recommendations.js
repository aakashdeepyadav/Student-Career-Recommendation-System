/**
 * Script to fix missing domain, salary_range, and skill_gaps in existing recommendations
 * Run this if users have recommendations without these fields
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixRecommendations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scrs');
    console.log('Connected to MongoDB');

    // Find all users with recommendations
    const users = await User.find({ 'recommendations.0': { $exists: true } });
    console.log(`Found ${users.length} users with recommendations`);

    let fixedCount = 0;
    let totalRecommendations = 0;

    for (const user of users) {
      let userFixed = false;
      
      for (let i = 0; i < user.recommendations.length; i++) {
        const rec = user.recommendations[i];
        totalRecommendations++;
        
        // Check if fields are missing
        const needsFix = !rec.domain || rec.domain === 'Unknown' || 
                        !rec.salary_range || rec.salary_range === 'N/A' ||
                        !rec.skill_gaps || Object.keys(rec.skill_gaps || {}).length === 0;
        
        if (needsFix) {
          console.log(`\n⚠️  User: ${user.username} - Recommendation: ${rec.title}`);
          console.log(`   Current domain: ${rec.domain}`);
          console.log(`   Current salary_range: ${rec.salary_range}`);
          console.log(`   Current skill_gaps: ${JSON.stringify(rec.skill_gaps)}`);
          
          // Note: We can't regenerate this data without the ML engine
          // This script just logs what needs to be fixed
          // Users will need to resubmit the questionnaire to get complete data
          
          userFixed = true;
        }
      }
      
      if (userFixed) {
        fixedCount++;
        console.log(`\n⚠️  User ${user.username} needs to resubmit questionnaire to fix recommendations`);
      }
    }

    console.log(`\n✅ Summary:`);
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Users needing fix: ${fixedCount}`);
    console.log(`   Total recommendations: ${totalRecommendations}`);
    console.log(`\n💡 Solution: Users need to resubmit the questionnaire to get complete data.`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
fixRecommendations();


