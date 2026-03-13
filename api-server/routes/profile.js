const express = require('express');
const axios = require('axios');

const router = express.Router();
const rawMlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8001';
const ML_ENGINE_URL = /^https?:\/\//i.test(rawMlEngineUrl)
  ? rawMlEngineUrl
  : `http://${rawMlEngineUrl}`;

const SKILL_KEYS = [
  'programming',
  'problem_solving',
  'communication',
  'creativity',
  'leadership',
  'analytical',
  'mathematics',
  'design',
  'research',
  'teamwork'
];

const SUBJECT_KEYS = ['stem', 'arts', 'business', 'social_sciences'];

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isLikertValue(value) {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

function validateAssessmentPayload(body) {
  const { riasec_responses, skill_responses, subject_preferences } = body || {};

  if (!isPlainObject(riasec_responses) || !isPlainObject(skill_responses) || !isPlainObject(subject_preferences)) {
    return 'Missing required questionnaire fields';
  }

  const riasecKeys = Object.keys(riasec_responses);
  if (riasecKeys.length !== 48) {
    return 'riasec_responses must contain exactly 48 responses';
  }

  for (const key of riasecKeys) {
    if (!/^[riasec][1-8]$/i.test(key)) {
      return `Invalid RIASEC response key: ${key}`;
    }
    if (!isLikertValue(riasec_responses[key])) {
      return `Invalid RIASEC response value for key: ${key}`;
    }
  }

  const skillKeys = Object.keys(skill_responses);
  if (skillKeys.length !== SKILL_KEYS.length) {
    return 'skill_responses must contain exactly 10 skills';
  }
  for (const key of SKILL_KEYS) {
    if (!(key in skill_responses)) {
      return `Missing skill response key: ${key}`;
    }
    if (!isLikertValue(skill_responses[key])) {
      return `Invalid skill response value for key: ${key}`;
    }
  }

  const subjectKeys = Object.keys(subject_preferences);
  if (subjectKeys.length !== SUBJECT_KEYS.length) {
    return 'subject_preferences must contain exactly 4 subjects';
  }
  for (const key of SUBJECT_KEYS) {
    if (!(key in subject_preferences)) {
      return `Missing subject preference key: ${key}`;
    }
    if (!isLikertValue(subject_preferences[key])) {
      return `Invalid subject preference value for key: ${key}`;
    }
  }

  return null;
}

function normalizeSkills(rawSkills) {
  const userSkills = {};
  for (const [skillName, value] of Object.entries(rawSkills || {})) {
    const numValue = typeof value === 'number' ? value : parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      userSkills[skillName] = (numValue - 1) / 4.0;
    }
  }
  return userSkills;
}

async function runRecommendationPipeline(riasecResponses, skillResponses, subjectPreferences) {
  const profileResponse = await axios.post(`${ML_ENGINE_URL}/profile`, {
    riasec_responses: riasecResponses,
    skill_responses: skillResponses,
    subject_preferences: subjectPreferences
  });
  const profileData = profileResponse.data;

  const clusterResponse = await axios.post(`${ML_ENGINE_URL}/cluster`, {
    combined_vector: profileData.combined_vector
  });
  const clusterData = clusterResponse.data;

  const recommendationsResponse = await axios.post(`${ML_ENGINE_URL}/recommend`, {
    combined_vector: profileData.combined_vector,
    user_skills: normalizeSkills(profileData.skills || skillResponses),
    top_k: 5
  });
  const recommendations = recommendationsResponse.data;

  const visualizationResponse = await axios.post(`${ML_ENGINE_URL}/visualize`, {
    combined_vector: profileData.combined_vector,
    recommended_career_ids: recommendations.map((r) => r.career_id)
  });

  return {
    profile: profileData,
    cluster: {
      ...clusterData,
      algorithm_used: clusterData.algorithm_used || null
    },
    recommendations,
    visualization: visualizationResponse.data
  };
}

router.post('/submit-public', async (req, res) => {
  try {
    const validationError = validateAssessmentPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { riasec_responses, skill_responses, subject_preferences } = req.body;

    const response = await runRecommendationPipeline(
      riasec_responses,
      skill_responses,
      subject_preferences
    );

    res.json(response);
  } catch (error) {
    console.error('Public assessment submission error:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

router.get('/model-statistics', async (req, res) => {
  try {
    const response = await axios.get(`${ML_ENGINE_URL}/model-statistics`, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching model statistics:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return res.status(503).json({
        error: 'ML Engine is not running',
        detail: `Cannot connect to ML Engine at ${ML_ENGINE_URL}`
      });
    }

    res.status(500).json({
      error: 'Failed to fetch model statistics',
      detail: error.response?.data || error.message
    });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Assessment routes are working!' });
});

module.exports = router;
