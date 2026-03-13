import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useProfileStore = create((set) => ({
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

  submitProfile: async (riasec_responses, skill_responses, subject_preferences) => {
    set({ loading: true, loadingStep: 0, error: null });
    
    // Simulate progress steps with delays to show user what's happening
    const updateStep = (step) => {
      set({ loadingStep: step });
    };
    
    try {
      const submitPath = '/assessment/submit-public';
      
      // Step 1: Calculating RIASEC summary
      updateStep(0);
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Step 2: Finding Cluster
      updateStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Mapping to Careers
      updateStep(2);
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      // Make the actual API call
      updateStep(3);
      const response = await axios.post(`${API_URL}${submitPath}`, {
        riasec_responses,
        skill_responses,
        subject_preferences
      });
      
      // Step 4: Analyzing Skill Gaps
      updateStep(4);
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      // Step 5: Creating Visualizations
      updateStep(5);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Log recommendations with skill gaps for debugging
      if (response.data.recommendations) {
        console.log('[STORE] Received recommendations:', response.data.recommendations.length);
        response.data.recommendations.forEach((rec, idx) => {
          if (rec.skill_gaps && Object.keys(rec.skill_gaps).length > 0) {
            console.log(`[STORE] ${rec.title} - Skill gaps:`, rec.skill_gaps);
          } else {
            console.log(`[STORE] ${rec.title} - No skill gaps`);
          }
        });
      }
      
      // Complete - show final step for a bit longer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    }
  },

}));

export default useProfileStore;

