import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WARMUP_TTL_MS = 2 * 60 * 1000;

let warmupPromise = null;
let lastWarmupAt = 0;

const useProfileStore = create((set, get) => ({
  profile: null,
  recommendations: null,
  cluster: null,
  visualization: null,
  loading: false,
  loadingStep: 0, // Track current step in progress (0-5)
  error: null,

  // Clear all assessment data
  clearProfile: () => {
    set({
      profile: null,
      recommendations: null,
      cluster: null,
      visualization: null,
      error: null,
      loadingStep: 0,
    });
  },

  warmUpServers: async (force = false) => {
    const now = Date.now();

    if (!force && now - lastWarmupAt < WARMUP_TTL_MS) {
      return { success: true, cached: true };
    }

    if (!force && warmupPromise) {
      return warmupPromise;
    }

    warmupPromise = axios
      .get(`${API_URL}/assessment/warmup`, { timeout: 65000 })
      .then(() => {
        lastWarmupAt = Date.now();
        return { success: true, cached: false };
      })
      .catch(() => {
        return { success: false };
      })
      .finally(() => {
        warmupPromise = null;
      });

    return warmupPromise;
  },

  submitProfile: async (riasec_responses, skill_responses, subject_preferences) => {
    set({ loading: true, loadingStep: 0, error: null });
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const updateStep = (step) => {
      set({ loadingStep: step });
    };

    const timers = [
      setTimeout(() => updateStep(1), 400),
      setTimeout(() => updateStep(2), 900),
    ];
    
    try {
      const submitPath = '/assessment/submit-public';

      await get().warmUpServers();

      updateStep(0);
      updateStep(3);

      const response = await axios.post(`${API_URL}${submitPath}`, {
        riasec_responses,
        skill_responses,
        subject_preferences
      });

      updateStep(4);
      await delay(300);

      updateStep(5);
      await delay(300);
      
      set({
        profile: response.data.profile,
        recommendations: response.data.recommendations,
        cluster: response.data.cluster,
        visualization: response.data.visualization,
        loading: false,
        loadingStep: 6, // Mark as complete
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to submit assessment',
        loading: false,
        loadingStep: 0,
      });
      return { success: false, error: error.response?.data?.error };
    } finally {
      timers.forEach((timer) => clearTimeout(timer));
    }
  },

}));

export default useProfileStore;

