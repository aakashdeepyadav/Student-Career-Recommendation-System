const express = require('express');
const axios = require('axios');

const router = express.Router();
const rawMlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8001';
const ML_ENGINE_URL = /^https?:\/\//i.test(rawMlEngineUrl)
  ? rawMlEngineUrl
  : `http://${rawMlEngineUrl}`;
const ML_REQUEST_TIMEOUT_MS = 65000;
const ML_TRANSIENT_RETRY_COUNT = 2;
const RETRYABLE_UPSTREAM_STATUS_CODES = new Set([502, 503, 504]);
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'ERR_NETWORK',
  'ETIMEDOUT'
]);

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

function isRetryableMlError(error) {
  const statusCode = error?.response?.status;
  if (statusCode && RETRYABLE_UPSTREAM_STATUS_CODES.has(statusCode)) {
    return true;
  }

  const code = error?.code;
  return Boolean(code && RETRYABLE_NETWORK_ERROR_CODES.has(code));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withMlRetry(requestFn) {
  let lastError;

  for (let attempt = 0; attempt <= ML_TRANSIENT_RETRY_COUNT; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const shouldRetry =
        attempt < ML_TRANSIENT_RETRY_COUNT && isRetryableMlError(error);

      if (!shouldRetry) {
        throw error;
      }

      await sleep(1200 * (attempt + 1));
    }
  }

  throw lastError;
}

async function runRecommendationPipeline(riasecResponses, skillResponses, subjectPreferences) {
  const assessResponse = await withMlRetry(() => axios.post(`${ML_ENGINE_URL}/assess`, {
    riasec_responses: riasecResponses,
    skill_responses: skillResponses,
    subject_preferences: subjectPreferences,
    top_k: 5
  }, { timeout: ML_REQUEST_TIMEOUT_MS }));
  const assessData = assessResponse.data;

  return {
    profile: assessData.profile,
    cluster: {
      ...(assessData.cluster || {}),
      algorithm_used: assessData?.cluster?.algorithm_used || null
    },
    recommendations: assessData.recommendations || []
  };
}

async function runVisualizationPipeline(combinedVector, recommendedCareerIds = []) {
  const visualizationResponse = await withMlRetry(() => axios.post(`${ML_ENGINE_URL}/visualize`, {
    combined_vector: combinedVector,
    recommended_career_ids: recommendedCareerIds
  }, { timeout: ML_REQUEST_TIMEOUT_MS }));

  return visualizationResponse.data;
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

    if (isRetryableMlError(error)) {
      return res.status(503).json({
        error: 'Assessment service is warming up. Please retry in a few seconds.',
        details: error.response?.data || error.message
      });
    }

    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

router.post('/visualize-public', async (req, res) => {
  try {
    const { combined_vector, recommended_career_ids } = req.body || {};

    if (!Array.isArray(combined_vector) || combined_vector.length === 0) {
      return res.status(400).json({ error: 'combined_vector must be a non-empty array' });
    }

    const visualization = await runVisualizationPipeline(
      combined_vector,
      Array.isArray(recommended_career_ids) ? recommended_career_ids : []
    );

    res.json({ visualization });
  } catch (error) {
    console.error('Public visualization error:', error.message);

    if (isRetryableMlError(error)) {
      return res.status(503).json({
        error: 'Visualization service is warming up. Please retry in a few seconds.',
        details: error.response?.data || error.message
      });
    }

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

router.get('/warmup', async (req, res) => {
  const startedAt = Date.now();

  try {
    const checks = await Promise.allSettled([
      axios.get(`${ML_ENGINE_URL}/health`, { timeout: 45000 }),
      axios.get(`${ML_ENGINE_URL}/`, { timeout: 45000 })
    ]);

    const healthReady = checks[0].status === 'fulfilled';
    const rootReady = checks[1].status === 'fulfilled';
    const ready = healthReady && rootReady;

    if (!ready) {
      return res.status(503).json({
        status: 'warming',
        ready,
        checks: {
          health: healthReady,
          root: rootReady
        },
        duration_ms: Date.now() - startedAt,
        detail: 'ML engine is still warming up. Please retry shortly.'
      });
    }

    return res.json({
      status: 'ready',
      ready: true,
      checks: {
        health: true,
        root: true
      },
      duration_ms: Date.now() - startedAt
    });
  } catch (error) {
    return res.status(503).json({
      status: 'warming',
      ready: false,
      duration_ms: Date.now() - startedAt,
      detail: error.message
    });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Assessment routes are working!' });
});

module.exports = router;
