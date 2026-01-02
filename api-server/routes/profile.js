const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8001';

// Submit profile questionnaire
router.post('/submit', auth, async (req, res) => {
  try {
    const { riasec_responses, skill_responses, subject_preferences } = req.body;
    
    // Log user information
    const userId = req.user._id;
    const username = req.user.username;
    const email = req.user.email;
    const hasExistingProfile = !!req.user.profile?.riasec_profile;
    
    console.log(`[API] Profile submission for user: ${username} (ID: ${userId}, Email: ${email})`);
    console.log(`[API] Has existing profile: ${hasExistingProfile ? 'YES - Will UPDATE' : 'NO - Will CREATE'}`);

    // Call ML engine to process profile
    const profileResponse = await axios.post(`${ML_ENGINE_URL}/profile`, {
      riasec_responses,
      skill_responses,
      subject_preferences
    });

    const profileData = profileResponse.data;
    
    console.log(`[API] ML Engine processed profile - RIASEC scores:`, profileData.riasec_profile);

    // Get cluster assignment
    const clusterResponse = await axios.post(`${ML_ENGINE_URL}/cluster`, {
      combined_vector: profileData.combined_vector
    });
    const clusterData = clusterResponse.data;

    // Normalize user skills from 1-5 scale to 0-1 scale
    // Priority: 1) profileData.skills, 2) req.body.skill_responses
    const userSkills = {};
    const rawSkills = profileData.skills || skill_responses || {};
    
    console.log('[API] Raw skills source:', profileData.skills ? 'profileData.skills' : 'skill_responses');
    console.log('[API] Raw skills data:', rawSkills);
    
    if (rawSkills && typeof rawSkills === 'object' && Object.keys(rawSkills).length > 0) {
      for (const [skillName, value] of Object.entries(rawSkills)) {
        // Convert 1-5 scale to 0-1 scale
        const numValue = typeof value === 'number' ? value : parseInt(value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
          const normalizedValue = (numValue - 1) / 4.0;
          userSkills[skillName] = normalizedValue;
        } else {
          console.log(`[API] WARNING: Invalid skill value for ${skillName}: ${value} (type: ${typeof value})`);
        }
      }
      console.log('[API] User skills normalized:', userSkills);
      console.log('[API] Number of skills normalized:', Object.keys(userSkills).length);
      
      if (Object.keys(userSkills).length === 0) {
        console.log('[API] ERROR: No valid skills were normalized! This will cause skill gaps to be incorrect.');
      }
    } else {
      console.log('[API] ERROR: No skills found in profileData or request body!');
      console.log('[API] profileData keys:', Object.keys(profileData || {}));
      console.log('[API] profileData.skills:', profileData?.skills);
      console.log('[API] skill_responses from request:', skill_responses);
    }

    // Get recommendations
    const recommendationsResponse = await axios.post(
      `${ML_ENGINE_URL}/recommend`,
      {
        combined_vector: profileData.combined_vector,
        user_skills: userSkills,
        top_k: 5
      }
    );
    const recommendations = recommendationsResponse.data;
    
    // Log what ML engine returned to verify all fields are present
    console.log(`[API] ML Engine returned ${recommendations.length} recommendations:`);
    recommendations.forEach((rec, idx) => {
      console.log(`[API] ML Engine Recommendation ${idx + 1}:`, {
        title: rec.title,
        domain: rec.domain,
        salary_range: rec.salary_range,
        skill_gaps: rec.skill_gaps,
        has_skill_gaps: !!rec.skill_gaps && Object.keys(rec.skill_gaps || {}).length > 0,
        required_skills: rec.required_skills
      });
      
      // Warn if ML engine didn't return required fields
      if (!rec.domain || rec.domain === 'Unknown') {
        console.warn(`[API] ⚠️ ML Engine returned missing domain for ${rec.title}`);
      }
      if (!rec.salary_range || rec.salary_range === 'N/A') {
        console.warn(`[API] ⚠️ ML Engine returned missing salary_range for ${rec.title}`);
      }
      if (!rec.skill_gaps || Object.keys(rec.skill_gaps || {}).length === 0) {
        console.warn(`[API] ⚠️ ML Engine returned missing/empty skill_gaps for ${rec.title}`);
      }
    });

    // Get visualization data
    const visualizationResponse = await axios.post(
      `${ML_ENGINE_URL}/visualize`,
      {
        combined_vector: profileData.combined_vector,
        recommended_career_ids: recommendations.map(r => r.career_id)
      }
    );
    const visualizationData = visualizationResponse.data;

    // Update user profile (this REPLACES existing profile data, not appends)
    // Store original responses AND processed data for complete persistence
    req.user.profile = {
      // Store original questionnaire responses for exact regeneration
      riasec_responses: riasec_responses,
      skill_responses: skill_responses,
      subject_preferences: subject_preferences,
      
      // Store processed RIASEC profile scores
      riasec_profile: profileData.riasec_profile,
      riasec_vector: profileData.riasec_vector,
      skill_vector: profileData.skill_vector,
      subject_vector: profileData.subject_vector,
      combined_vector: profileData.combined_vector,
      skills: profileData.skills,
      last_updated: new Date() // Update timestamp
    };

    req.user.cluster = {
      cluster_id: clusterData.cluster_id,
      cluster_name: clusterData.cluster_name,
      algorithm_used: clusterData.algorithm_used || null // Include algorithm info if available
    };

    // REPLACE all recommendations (not append) - when user retakes test, old recommendations are replaced
    // This ensures users always see their latest test results, not accumulated old data
    req.user.recommendations = recommendations.map(rec => {
      // Ensure we have all fields from ML engine response
      const domain = rec.domain || 'Unknown';
      const salaryRange = rec.salary_range || 'N/A';
      const skillGaps = rec.skill_gaps || {};
      const requiredSkills = rec.required_skills || [];
      
      // Validate and log
      if (!domain || domain === 'Unknown') {
        console.warn(`[API] WARNING: ML engine returned missing domain for ${rec.title}`);
      }
      if (!salaryRange || salaryRange === 'N/A') {
        console.warn(`[API] WARNING: ML engine returned missing salary_range for ${rec.title}`);
      }
      if (!skillGaps || Object.keys(skillGaps).length === 0) {
        console.warn(`[API] WARNING: ML engine returned missing/empty skill_gaps for ${rec.title}`);
      }
      
      // Ensure career_id is saved - this is critical for visualization
      const careerId = rec.career_id || rec.id || '';
      if (!careerId) {
        console.warn(`[API] ⚠️ WARNING: Recommendation ${rec.title} has no career_id or id - this will break visualization!`);
        console.warn(`[API] ML Engine response for this recommendation:`, {
          career_id: rec.career_id,
          id: rec.id,
          title: rec.title,
          all_keys: Object.keys(rec || {})
        });
      }
      
      const recommendation = {
        career_id: careerId, // Always save career_id for visualization
        title: rec.title || '',
        description: rec.description || '',
        similarity_score: rec.similarity_score || 0,
        domain: domain,
        salary_range: salaryRange,
        required_skills: requiredSkills,
        skill_gaps: skillGaps,
        timestamp: new Date()
      };
      
      // Log each recommendation to verify all fields are present, especially career_id
      console.log(`[API] Saving recommendation to MongoDB:`, {
        title: recommendation.title,
        career_id: recommendation.career_id, // CRITICAL for visualization
        domain: recommendation.domain,
        salary_range: recommendation.salary_range,
        skill_gaps_count: Object.keys(recommendation.skill_gaps).length,
        skill_gaps: recommendation.skill_gaps,
        required_skills_count: recommendation.required_skills.length
      });
      
      return recommendation;
    });
    
    console.log(`[API] Saving profile data for user: ${username} (ID: ${userId})`);
    console.log(`[API] Storing original responses:`, {
      riasec_count: Object.keys(riasec_responses || {}).length,
      skill_count: Object.keys(skill_responses || {}).length,
      subject_count: Object.keys(subject_preferences || {}).length
    });
    console.log(`[API] RIASEC Profile Scores:`, profileData.riasec_profile);
    console.log(`[API] Cluster: ${clusterData.cluster_name} (ID: ${clusterData.cluster_id})`);
    console.log(`[API] Recommendations count: ${recommendations.length}`);
    console.log(`[API] Full recommendations data being saved:`, 
      req.user.recommendations.map(r => ({ 
        title: r.title,
        domain: r.domain,
        salary_range: r.salary_range,
        skill_gaps: r.skill_gaps,
        required_skills: r.required_skills
      }))
    );

    // Mark recommendations as modified to ensure Mongoose saves nested objects
    req.user.markModified('recommendations');
    req.user.markModified('profile');
    
    // Clear old visualization data when profile is resubmitted
    // This ensures visualization will be regenerated with new recommendations
    req.user.visualization = undefined;
    
    // Save to MongoDB - this will UPDATE existing user document
    await req.user.save();
    
    // Verify data was saved correctly by reloading from database using lean()
    const savedUser = await User.findById(userId).lean();
    if (savedUser && savedUser.recommendations && savedUser.recommendations.length > 0) {
      console.log(`[API] ✓ Verification - Data saved to MongoDB:`);
      savedUser.recommendations.forEach((rec, idx) => {
        console.log(`[API]   Recommendation ${idx + 1} in DB:`, {
          title: rec.title,
          domain: rec.domain,
          salary_range: rec.salary_range,
          has_skill_gaps: !!rec.skill_gaps && typeof rec.skill_gaps === 'object' && Object.keys(rec.skill_gaps || {}).length > 0,
          skill_gaps_keys: rec.skill_gaps && typeof rec.skill_gaps === 'object' ? Object.keys(rec.skill_gaps) : [],
          all_keys: Object.keys(rec || {})
        });
        
        // Warn if fields are still missing after save
        if (!rec.domain || rec.domain === 'Unknown') {
          console.error(`[API] ❌ ERROR: Domain NOT saved for ${rec.title} - Check Mongoose schema!`);
        }
        if (!rec.salary_range || rec.salary_range === 'N/A') {
          console.error(`[API] ❌ ERROR: Salary_range NOT saved for ${rec.title} - Check Mongoose schema!`);
        }
        if (!rec.skill_gaps || Object.keys(rec.skill_gaps || {}).length === 0) {
          console.error(`[API] ❌ ERROR: Skill_gaps NOT saved for ${rec.title} - Check Mongoose schema!`);
        }
      });
    }
    
    console.log(`[API] ✓ Profile data saved successfully to MongoDB for user: ${username} (ID: ${userId})`);

    res.json({
      profile: profileData,
      cluster: {
        ...clusterData,
        algorithm_used: clusterData.algorithm_used || null // Ensure algorithm info is included
      },
      recommendations,
      visualization: visualizationData
    });
  } catch (error) {
    console.error('Profile submission error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const username = req.user.username;
    
    // Use lean() to get plain JavaScript objects (faster and ensures all fields are included)
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`[API] Fetching profile for user: ${username} (ID: ${userId})`);
    console.log(`[API] Has profile: ${!!user.profile?.riasec_profile}`);
    console.log(`[API] Has cluster: ${!!user.cluster?.cluster_name}`);
    console.log(`[API] Recommendations count: ${user.recommendations?.length || 0}`);
    
    if (user.profile?.riasec_profile) {
      console.log(`[API] RIASEC scores from MongoDB:`, user.profile.riasec_profile);
      console.log(`[API] Has original responses:`, {
        riasec: !!user.profile.riasec_responses,
        skills: !!user.profile.skill_responses,
        subjects: !!user.profile.subject_preferences
      });
    }
    
    // Log recommendations being returned
    if (user.recommendations && user.recommendations.length > 0) {
      console.log(`[API] Returning ${user.recommendations.length} recommendations from MongoDB:`);
      user.recommendations.forEach((rec, idx) => {
        console.log(`[API] Recommendation ${idx + 1}:`, {
          title: rec.title,
          domain: rec.domain,
          salary_range: rec.salary_range,
          skill_gaps: rec.skill_gaps,
          skill_gaps_type: typeof rec.skill_gaps,
          skill_gaps_keys: rec.skill_gaps ? Object.keys(rec.skill_gaps) : [],
          has_skill_gaps: !!rec.skill_gaps && typeof rec.skill_gaps === 'object' && Object.keys(rec.skill_gaps).length > 0,
          required_skills: rec.required_skills,
          required_skills_type: Array.isArray(rec.required_skills)
        });
      });
    } else {
      console.log(`[API] WARNING: No recommendations found in MongoDB for user ${username}`);
    }
    
    // Check if recommendations are missing critical fields - if so, regenerate from ML engine
    const needsRegeneration = user.recommendations && user.recommendations.length > 0 && 
      user.recommendations.some(rec => !rec.domain || !rec.salary_range || !rec.skill_gaps || Object.keys(rec.skill_gaps || {}).length === 0);
    
    let recommendationsToReturn = [];
    
    if (needsRegeneration && user.profile?.combined_vector) {
      console.log(`[API] ⚠️ Recommendations missing fields - Regenerating from ML engine for user ${username}`);
      
      try {
        // Normalize user skills from saved profile
        const userSkills = {};
        if (user.profile.skills && typeof user.profile.skills === 'object') {
          for (const [skillName, value] of Object.entries(user.profile.skills)) {
            const numValue = typeof value === 'number' ? value : parseInt(value);
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
              const normalizedValue = (numValue - 1) / 4.0;
              userSkills[skillName] = normalizedValue;
            }
          }
        }
        
        // Regenerate recommendations from ML engine
        const recommendationsResponse = await axios.post(
          `${ML_ENGINE_URL}/recommend`,
          {
            combined_vector: user.profile.combined_vector,
            user_skills: userSkills,
            top_k: user.recommendations.length || 5
          }
        );
        
        const freshRecommendations = recommendationsResponse.data;
        
        // Update recommendations in MongoDB with complete data
        const updatedRecommendations = freshRecommendations.map(rec => {
          const careerId = rec.career_id || rec.id || '';
          if (!careerId) {
            console.warn(`[API] ⚠️ WARNING: Regenerated recommendation ${rec.title} has no career_id or id!`);
          }
          
          return {
            career_id: careerId, // Always save career_id for visualization
            title: rec.title || '',
            description: rec.description || '',
            similarity_score: rec.similarity_score || 0,
            domain: rec.domain || 'Unknown',
            salary_range: rec.salary_range || 'N/A',
            required_skills: Array.isArray(rec.required_skills) ? rec.required_skills : (rec.required_skills || []),
            skill_gaps: rec.skill_gaps && typeof rec.skill_gaps === 'object' ? rec.skill_gaps : {},
            timestamp: new Date()
          };
        });
        
        // Update user document with markModified to ensure Mongoose saves nested objects
        const userDoc = await User.findById(userId);
        if (userDoc) {
          userDoc.recommendations = updatedRecommendations;
          userDoc.markModified('recommendations');
          await userDoc.save();
          
          console.log(`[API] ✓ Regenerated and saved ${updatedRecommendations.length} recommendations with complete data`);
          
          // Verify save
          const verifyUser = await User.findById(userId).lean();
          if (verifyUser && verifyUser.recommendations && verifyUser.recommendations.length > 0) {
            console.log(`[API] ✓ Verification: Saved recommendations have:`, {
              count: verifyUser.recommendations.length,
              first_rec: {
                title: verifyUser.recommendations[0].title,
                has_domain: !!verifyUser.recommendations[0].domain && verifyUser.recommendations[0].domain !== 'Unknown',
                has_salary: !!verifyUser.recommendations[0].salary_range && verifyUser.recommendations[0].salary_range !== 'N/A',
                has_skill_gaps: !!verifyUser.recommendations[0].skill_gaps && typeof verifyUser.recommendations[0].skill_gaps === 'object' && Object.keys(verifyUser.recommendations[0].skill_gaps || {}).length > 0
              }
            });
          }
        }
        
        recommendationsToReturn = updatedRecommendations;
      } catch (error) {
        console.error(`[API] Error regenerating recommendations:`, error);
        // Fall through to use existing data with defaults
      }
    }
    
    // If regeneration didn't happen or failed, use existing data
    if (recommendationsToReturn.length === 0) {
      recommendationsToReturn = (user.recommendations || []).map(rec => {
        // Log raw data from MongoDB to debug
        console.log(`[API] Raw recommendation from MongoDB for ${rec.title || 'Unknown'}:`, {
          has_domain: !!rec.domain,
          domain_value: rec.domain,
          has_salary_range: !!rec.salary_range,
          salary_range_value: rec.salary_range,
          has_skill_gaps: !!rec.skill_gaps,
          skill_gaps_type: typeof rec.skill_gaps,
          skill_gaps_keys: rec.skill_gaps && typeof rec.skill_gaps === 'object' ? Object.keys(rec.skill_gaps) : [],
          all_keys: Object.keys(rec || {})
        });
        
        // Ensure skill_gaps is a proper object
        let skillGaps = {};
        if (rec.skill_gaps) {
          if (typeof rec.skill_gaps === 'object' && !Array.isArray(rec.skill_gaps)) {
            skillGaps = rec.skill_gaps;
          } else if (typeof rec.skill_gaps === 'string') {
            try {
              skillGaps = JSON.parse(rec.skill_gaps);
            } catch (e) {
              console.warn(`[API] Failed to parse skill_gaps for ${rec.title}:`, e);
            }
          }
        }
        
        // Get domain and salary_range - use actual value from MongoDB, don't default unnecessarily
        const domain = (rec.domain && String(rec.domain).trim() !== '' && rec.domain !== 'Unknown') 
          ? String(rec.domain).trim() 
          : (rec.domain || 'Not specified');
        const salaryRange = (rec.salary_range && String(rec.salary_range).trim() !== '' && rec.salary_range !== 'N/A') 
          ? String(rec.salary_range).trim() 
          : (rec.salary_range || 'Not specified');
        
        // Only warn if fields are truly missing
        if (!rec.domain || rec.domain === 'Unknown' || String(rec.domain).trim() === '') {
          console.warn(`[API] ⚠️ WARNING: Missing domain for ${rec.title}`);
        }
        if (!rec.salary_range || rec.salary_range === 'N/A' || String(rec.salary_range).trim() === '') {
          console.warn(`[API] ⚠️ WARNING: Missing salary_range for ${rec.title}`);
        }
        if (!skillGaps || Object.keys(skillGaps).length === 0) {
          console.warn(`[API] ⚠️ WARNING: Missing or empty skill_gaps for ${rec.title}`);
        }
        
        const result = {
          career_id: rec.career_id || rec.id || '',
          title: rec.title || '',
          description: rec.description || '',
          similarity_score: rec.similarity_score || 0,
          domain: domain,
          salary_range: salaryRange,
          required_skills: Array.isArray(rec.required_skills) ? rec.required_skills : (rec.required_skills || []),
          skill_gaps: skillGaps,
          timestamp: rec.timestamp || null
        };
        
        console.log(`[API] Processed recommendation for ${rec.title}:`, {
          domain: result.domain,
          salary_range: result.salary_range,
          skill_gaps_count: Object.keys(result.skill_gaps).length,
          skill_gaps: result.skill_gaps
        });
        
        return result;
      });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || null,
        userInfo: user.userInfo || null
      },
      profile: {
        // Return processed profile data (what UI needs)
        riasec_profile: user.profile?.riasec_profile || null,
        riasec_vector: user.profile?.riasec_vector || null,
        skill_vector: user.profile?.skill_vector || null,
        subject_vector: user.profile?.subject_vector || null,
        combined_vector: user.profile?.combined_vector || null,
        skills: user.profile?.skills || null,
        last_updated: user.profile?.last_updated || null,
        // Also include original responses if needed for regeneration
        riasec_responses: user.profile?.riasec_responses || null,
        skill_responses: user.profile?.skill_responses || null,
        subject_preferences: user.profile?.subject_preferences || null
      },
      cluster: user.cluster || null,
      recommendations: recommendationsToReturn
    });
  } catch (error) {
    console.error(`[API] Error fetching profile:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get visualization data
router.get('/visualize', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const username = req.user.username;
    
    if (!req.user.profile?.combined_vector) {
      console.log(`[API] Visualization request failed - No profile for user: ${username} (ID: ${userId})`);
      return res.status(400).json({ error: 'Profile not found. Please submit questionnaire first.' });
    }

    // Get recommended career IDs from saved recommendations
    // Use lean() to get fresh data from MongoDB with all fields
    const userWithRecs = await User.findById(userId).lean();
    
    if (!userWithRecs || !userWithRecs.profile?.combined_vector) {
      console.log(`[API] Visualization request failed - No profile for user: ${username} (ID: ${userId})`);
      return res.status(400).json({ error: 'Profile not found. Please submit questionnaire first.' });
    }
    
    const recommendedCareerIds = userWithRecs.recommendations && userWithRecs.recommendations.length > 0
      ? userWithRecs.recommendations
          .map(rec => {
            // Try multiple possible field names - prioritize career_id
            const careerId = rec.career_id || rec.id || rec._id;
            if (careerId) {
              // Convert to string and ensure it's not empty
              const idStr = String(careerId).trim();
              return idStr && idStr !== '' && idStr !== 'null' && idStr !== 'undefined' ? idStr : null;
            }
            return null;
          })
          .filter(id => id !== null && id !== '')
      : [];
    
    // Log what we're extracting
    console.log(`[API] Extracting career IDs from recommendations:`, {
      recommendations_count: userWithRecs.recommendations?.length || 0,
      extracted_ids: recommendedCareerIds,
      sample_recommendation: userWithRecs.recommendations?.[0] ? {
        title: userWithRecs.recommendations[0].title,
        career_id: userWithRecs.recommendations[0].career_id,
        id: userWithRecs.recommendations[0].id,
        all_keys: Object.keys(userWithRecs.recommendations[0] || {})
      } : null
    });

    console.log(`[API] Generating visualization for user: ${username} (ID: ${userId})`);
    console.log(`[API] Using combined_vector from saved profile (length: ${userWithRecs.profile.combined_vector.length})`);
    console.log(`[API] User has ${userWithRecs.recommendations?.length || 0} recommendations in MongoDB`);
    console.log(`[API] Extracted ${recommendedCareerIds.length} recommended career IDs:`, recommendedCareerIds);

    // Validate that we have career IDs - critical for visualization
    if (recommendedCareerIds.length === 0 && userWithRecs.recommendations && userWithRecs.recommendations.length > 0) {
      console.error(`[API] ❌ ERROR: No recommended career IDs found for user ${username} - visualization will not highlight recommendations!`);
      console.error(`[API] Recommendations in DB:`, userWithRecs.recommendations?.map(r => ({
        title: r.title,
        career_id: r.career_id,
        id: r.id,
        _id: r._id,
        all_keys: Object.keys(r || {})
      })));
      console.error(`[API] This means career_id was not saved properly. Recommendations need to be regenerated.`);
    }

    // Check if visualization data exists in MongoDB and is still valid
    // Only regenerate if visualization is missing or recommendations have changed
    const hasSavedVisualization = userWithRecs.visualization && 
                                  userWithRecs.visualization.recommended_career_indices &&
                                  userWithRecs.visualization.recommended_career_indices.length > 0;
    
    if (hasSavedVisualization) {
      console.log(`[API] ✓ Found saved visualization data for user: ${username}`);
      console.log(`[API] Saved visualization includes:`, {
        has_careers_2d: !!userWithRecs.visualization.careers_2d,
        careers_2d_count: userWithRecs.visualization.careers_2d?.length || 0,
        has_careers_3d: !!userWithRecs.visualization.careers_3d,
        careers_3d_count: userWithRecs.visualization.careers_3d?.length || 0,
        has_recommended_indices: !!userWithRecs.visualization.recommended_career_indices,
        recommended_indices_count: userWithRecs.visualization.recommended_career_indices?.length || 0,
        recommended_indices: userWithRecs.visualization.recommended_career_indices
      });
      
      // Return saved visualization data
      return res.json({
        user_2d: userWithRecs.visualization.user_2d,
        user_3d: userWithRecs.visualization.user_3d,
        careers_2d: userWithRecs.visualization.careers_2d,
        careers_3d: userWithRecs.visualization.careers_3d,
        career_titles: userWithRecs.visualization.career_titles,
        recommended_career_indices: userWithRecs.visualization.recommended_career_indices,
        clusters_2d: userWithRecs.visualization.clusters_2d,
        clusters_3d: userWithRecs.visualization.clusters_3d,
        students_2d: userWithRecs.visualization.students_2d,
        students_3d: userWithRecs.visualization.students_3d,
        student_clusters: userWithRecs.visualization.student_clusters
      });
    }
    
    // Generate new visualization if not saved
    console.log(`[API] No saved visualization found - generating new visualization for user: ${username}`);
    
    try {
      // Prepare request body - ML engine requires recommended_career_ids
      const requestBody = {
        combined_vector: userWithRecs.profile.combined_vector
      };
      
      if (recommendedCareerIds.length > 0) {
        requestBody.recommended_career_ids = recommendedCareerIds;
        console.log(`[API] Sending ${recommendedCareerIds.length} career IDs to ML engine:`, recommendedCareerIds);
      } else {
        console.warn(`[API] ⚠️ No career IDs available - visualization will show all careers but won't highlight recommendations`);
        // Still send request, but without recommended_career_ids - ML engine will handle it
      }
      
      const visualizationResponse = await axios.post(
        `${ML_ENGINE_URL}/visualize`,
        requestBody,
        {
          timeout: 30000 // 30 second timeout
        }
      );

      console.log(`[API] ✓ Visualization generated successfully for user: ${username} (ID: ${userId})`);
      console.log(`[API] Visualization data includes:`, {
        has_careers_2d: !!visualizationResponse.data.careers_2d,
        careers_2d_count: visualizationResponse.data.careers_2d?.length || 0,
        has_careers_3d: !!visualizationResponse.data.careers_3d,
        careers_3d_count: visualizationResponse.data.careers_3d?.length || 0,
        has_career_titles: !!visualizationResponse.data.career_titles,
        career_titles_count: visualizationResponse.data.career_titles?.length || 0,
        has_recommended_indices: !!visualizationResponse.data.recommended_career_indices,
        recommended_indices: visualizationResponse.data.recommended_career_indices,
        recommended_indices_count: visualizationResponse.data.recommended_career_indices?.length || 0,
        all_keys: Object.keys(visualizationResponse.data || {})
      });
      
      // Validate response structure
      if (!visualizationResponse.data.careers_2d || !visualizationResponse.data.careers_3d) {
        console.error(`[API] ❌ ERROR: ML engine returned incomplete visualization data`);
        throw new Error('ML engine returned incomplete visualization data');
      }
      
      // Save visualization data to MongoDB for future use
      const visualizationData = {
        user_2d: visualizationResponse.data.user_2d,
        user_3d: visualizationResponse.data.user_3d,
        careers_2d: visualizationResponse.data.careers_2d,
        careers_3d: visualizationResponse.data.careers_3d,
        career_titles: visualizationResponse.data.career_titles,
        recommended_career_indices: visualizationResponse.data.recommended_career_indices, // CRITICAL: Save this!
        clusters_2d: visualizationResponse.data.clusters_2d,
        clusters_3d: visualizationResponse.data.clusters_3d,
        students_2d: visualizationResponse.data.students_2d,
        students_3d: visualizationResponse.data.students_3d,
        student_clusters: visualizationResponse.data.student_clusters,
        last_generated: new Date()
      };
      
      // Update user document with visualization data
      const userDoc = await User.findById(userId);
      if (userDoc) {
        userDoc.visualization = visualizationData;
        userDoc.markModified('visualization');
        await userDoc.save();
        console.log(`[API] ✓ Saved visualization data to MongoDB for user: ${username}`);
        console.log(`[API] ✓ Saved recommended_career_indices:`, visualizationData.recommended_career_indices);
      }
      
      res.json(visualizationResponse.data);
    } catch (axiosError) {
      console.error(`[API] ❌ ERROR: Failed to get visualization from ML engine:`, {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        url: `${ML_ENGINE_URL}/visualize`
      });
      throw axiosError;
    }
  } catch (error) {
    console.error(`[API] Visualization error for user ${req.user?.username}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Upload profile image
// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Use "image" as the field name.' });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
};

router.post('/upload-image', auth, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      // Delete uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`[API] Deleted old profile image: ${oldImagePath}`);
      }
    }

    // Save image path relative to uploads directory
    const imagePath = `/uploads/profile-images/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    console.log(`[API] Profile image uploaded for user: ${req.user.username} (ID: ${userId})`);
    console.log(`[API] Image saved at: ${imagePath}`);

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imagePath // Return the path that can be used as URL
    });
  } catch (error) {
    console.error('[API] Error uploading profile image:', error);
    
    // Delete uploaded file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[API] Error deleting uploaded file:', unlinkError);
      }
    }
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Delete profile image
router.delete('/delete-image', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.profileImage) {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`[API] Deleted profile image: ${imagePath}`);
      }
    }

    user.profileImage = null;
    await user.save();

    console.log(`[API] Profile image deleted for user: ${req.user.username} (ID: ${userId})`);

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('[API] Error deleting profile image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update profile information (name, bio, etc.)
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, phone, location, occupation, interests } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields (we'll add these to the schema if needed)
    // For now, we can store them in a separate field or extend the schema
    // Let's add a userInfo field to store additional profile data
    if (!user.userInfo) {
      user.userInfo = {};
    }

    if (fullName !== undefined) user.userInfo.fullName = fullName;
    if (bio !== undefined) user.userInfo.bio = bio;
    if (phone !== undefined) user.userInfo.phone = phone;
    if (location !== undefined) user.userInfo.location = location;
    if (occupation !== undefined) user.userInfo.occupation = occupation;
    if (interests !== undefined) user.userInfo.interests = interests;

    user.markModified('userInfo');
    await user.save();

    console.log(`[API] Profile updated for user: ${req.user.username} (ID: ${userId})`);

    res.json({
      message: 'Profile updated successfully',
      userInfo: user.userInfo
    });
  } catch (error) {
    console.error('[API] Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route to verify profile routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Profile routes are working!' });
});

// Get model statistics - no auth required as it's general model info
router.get('/model-statistics', auth, async (req, res) => {
  try {
    console.log('[API] Fetching model statistics from ML engine...');
    console.log('[API] ML Engine URL:', ML_ENGINE_URL);
    
    const response = await axios.get(`${ML_ENGINE_URL}/model-statistics`, {
      timeout: 60000 // 60 second timeout for metrics calculation (external metrics can take time)
    });
    
    console.log('[API] Model statistics received successfully');
    console.log('[API] Has external_metrics:', !!response.data.external_metrics);
    if (response.data.external_metrics) {
      console.log('[API] External metrics keys:', Object.keys(response.data.external_metrics));
    }
    res.json(response.data);
  } catch (error) {
    console.error('[API] Error fetching model statistics:', error.message);
    console.error('[API] Error details:', error.response?.data || error.code);
    
    // If ML Engine is not running, return a helpful error
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return res.status(503).json({ 
        error: 'ML Engine is not running',
        detail: `Cannot connect to ML Engine at ${ML_ENGINE_URL}. Please ensure the ML Engine server is running.`,
        suggestion: 'Start the ML Engine server: cd ml-engine && python -m uvicorn app:app --reload --port 8001'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch model statistics',
      detail: error.response?.data || error.message 
    });
  }
});

module.exports = router;

