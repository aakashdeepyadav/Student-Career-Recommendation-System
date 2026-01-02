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

  // Clear all profile data (useful for logout)
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
      const token = localStorage.getItem('token');
      
      // Step 1: Calculating RIASEC Profile
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
      const response = await axios.post(
        `${API_URL}/profile/submit`,
        { riasec_responses, skill_responses, subject_preferences },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
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
        error: error.response?.data?.error || 'Failed to submit profile',
        loading: false,
        loadingStep: 0,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Log profile data when fetching from database
      console.log('[STORE] Profile data loaded from database:');
      console.log('  - Profile exists:', !!response.data.profile);
      console.log('  - RIASEC profile:', response.data.profile?.riasec_profile);
      console.log('  - Cluster:', response.data.cluster);
      console.log('  - Recommendations count:', response.data.recommendations?.length || 0);
      
      // Log recommendations when fetching from database
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        console.log('[STORE] Fetched recommendations from DB:', response.data.recommendations.length);
        response.data.recommendations.forEach((rec, idx) => {
          console.log(`[STORE] Recommendation ${idx + 1} from DB:`, {
            title: rec.title,
            domain: rec.domain,
            salary_range: rec.salary_range,
            skill_gaps: rec.skill_gaps,
            has_skill_gaps: !!rec.skill_gaps && Object.keys(rec.skill_gaps || {}).length > 0,
            required_skills: rec.required_skills,
            similarity_score: rec.similarity_score
          });
          
          // Warn if critical fields are missing
          if (!rec.domain || rec.domain === 'Unknown') {
            console.warn(`[STORE] WARNING: Missing domain for ${rec.title}`);
          }
          if (!rec.salary_range || rec.salary_range === 'N/A') {
            console.warn(`[STORE] WARNING: Missing salary_range for ${rec.title}`);
          }
          if (!rec.skill_gaps || Object.keys(rec.skill_gaps || {}).length === 0) {
            console.warn(`[STORE] WARNING: Missing or empty skill_gaps for ${rec.title}`);
          }
        });
      } else {
        console.log('[STORE] No recommendations found in database');
      }
      
      set({
        profile: response.data.profile,
        recommendations: response.data.recommendations || [],
        cluster: response.data.cluster,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: error.response?.data?.error, loading: false });
    }
  },

  fetchVisualization: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/visualize`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[STORE] Visualization data loaded:', {
        hasUser2D: !!response.data.user_2d,
        hasUser3D: !!response.data.user_3d,
        careers2DCount: response.data.careers_2d?.length || 0,
        careers3DCount: response.data.careers_3d?.length || 0,
        hasCareerTitles: !!response.data.career_titles,
        careerTitlesCount: response.data.career_titles?.length || 0,
        hasRecommendedIndices: !!response.data.recommended_career_indices,
        recommendedIndices: response.data.recommended_career_indices,
        hasClusters2D: !!response.data.clusters_2d,
        hasClusters3D: !!response.data.clusters_3d,
        hasStudents2D: !!response.data.students_2d,
        hasStudents3D: !!response.data.students_3d
      });
      
      if (!response.data.careers_2d || response.data.careers_2d.length === 0) {
        console.warn('[STORE] ⚠️ WARNING: Visualization data missing careers_2d');
      }
      if (!response.data.careers_3d || response.data.careers_3d.length === 0) {
        console.warn('[STORE] ⚠️ WARNING: Visualization data missing careers_3d');
      }
      if (!response.data.recommended_career_indices || response.data.recommended_career_indices.length === 0) {
        console.warn('[STORE] ⚠️ WARNING: Visualization data missing recommended_career_indices');
      }
      
      // Validate visualization data structure
      if (!response.data.careers_2d || !response.data.careers_3d) {
        console.error('[STORE] ❌ ERROR: Visualization data missing required fields:', {
          has_careers_2d: !!response.data.careers_2d,
          has_careers_3d: !!response.data.careers_3d,
          response_keys: Object.keys(response.data || {})
        });
        throw new Error('Visualization data is incomplete. Please try again.');
      }
      
      set({ visualization: response.data, loading: false, error: null });
      console.log('[STORE] ✓ Visualization data set in store successfully');
    } catch (error) {
      console.error('[STORE] ❌ Visualization fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      set({ 
        visualization: null, // Clear any partial visualization data
        error: error.response?.data?.error || error.message || 'Failed to load visualization data', 
        loading: false 
      });
    }
  },
}));

export default useProfileStore;

