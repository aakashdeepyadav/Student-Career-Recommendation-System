import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { waitForAppWarmup } from '../lib/initAppWarmup';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SUBMIT_RETRY_COUNT = 2;
const SUBMIT_RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

const useProfileStore = create(
  persist(
    (set, get) => ({
  profile: null,
  recommendations: null,
  cluster: null,
  visualization: null,
  loadingVisualization: false,
  visualizationError: null,
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
      loadingVisualization: false,
      visualizationError: null,
      error: null,
      loadingStep: 0,
    });
  },

  submitProfile: async (riasec_responses, skill_responses, subject_preferences) => {
    set({ loading: true, loadingStep: 0, error: null });
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const updateStep = (step) => {
      set({ loadingStep: step });
    };

    const timers = [
      setTimeout(() => updateStep(1), 350),
      setTimeout(() => updateStep(2), 850),
    ];
    let progressInterval;
    
    try {
      const submitPath = '/assessment/submit-public';
      await waitForAppWarmup();

      updateStep(0);
      updateStep(3);

      // Keep progress moving naturally while waiting for backend response.
      progressInterval = setInterval(() => {
        set((state) => {
          if (state.loading && state.loadingStep < 4) {
            return { loadingStep: state.loadingStep + 1 };
          }
          return state;
        });
      }, 900);

      let response;
      let lastError;
      for (let attempt = 0; attempt <= SUBMIT_RETRY_COUNT; attempt += 1) {
        try {
          response = await axios.post(`${API_URL}${submitPath}`, {
            riasec_responses,
            skill_responses,
            subject_preferences,
          });
          break;
        } catch (error) {
          lastError = error;
          const statusCode = error?.response?.status;
          const shouldRetry =
            attempt < SUBMIT_RETRY_COUNT &&
            (!statusCode || SUBMIT_RETRYABLE_STATUS_CODES.has(statusCode));

          if (!shouldRetry) {
            throw error;
          }

          await sleep(1200 * (attempt + 1));
        }
      }

      if (!response) {
        throw lastError;
      }

      clearInterval(progressInterval);
      updateStep(4);
      await delay(260);

      updateStep(5);
      await delay(260);
      
      set({
        profile: response.data.profile,
        recommendations: response.data.recommendations,
        cluster: response.data.cluster,
        visualization: response.data.visualization || null,
        loadingVisualization: false,
        visualizationError: null,
        loading: false,
        loadingStep: 6, // Mark as complete
      });
      return { success: true };
    } catch (error) {
      clearInterval(progressInterval);
      set({
        error: error.response?.data?.error || 'Failed to submit assessment',
        loading: false,
        loadingStep: 0,
      });
      return { success: false, error: error.response?.data?.error };
    } finally {
      clearInterval(progressInterval);
      timers.forEach((timer) => clearTimeout(timer));
    }
  },

  fetchVisualization: async () => {
    const { profile, recommendations, visualization } = get();

    if (!profile?.combined_vector || visualization) {
      return { success: true, skipped: true };
    }

    set({ loadingVisualization: true, visualizationError: null });

    try {
      const response = await axios.post(`${API_URL}/assessment/visualize-public`, {
        combined_vector: profile.combined_vector,
        recommended_career_ids: (recommendations || []).map((r) => r.career_id),
      });

      set({
        visualization: response.data?.visualization || null,
        loadingVisualization: false,
        visualizationError: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loadingVisualization: false,
        visualizationError:
          error.response?.data?.error || 'Failed to load visualization data',
      });

      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load visualization data',
      };
    }
  },

    }),
    {
      name: 'scrs-profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        recommendations: state.recommendations,
        cluster: state.cluster,
        visualization: state.visualization,
      }),
    },
  ),
);

export default useProfileStore;

