import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useAuthStore = create((set, get) => ({
  user: (() => {
    // Try to restore user from localStorage on initialization
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        return null;
      }
    }
    return null;
  })(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  // Initialize auth state on app load
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token, clear user data
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      // First, try to restore from localStorage immediately (for instant UI update)
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const user = JSON.parse(savedProfile);
          set({ user, isAuthenticated: true });
        } catch (e) {
          // Invalid saved data, will fetch fresh
        }
      }

      // Fetch fresh user data from server to ensure it's up to date
      const profileResponse = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Extract user info from response
      const userData = profileResponse.data;
      if (userData.user) {
        const user = {
          id: userData.user.id || userData.user._id,
          username: userData.user.username,
          email: userData.user.email,
          profileImage: userData.user.profileImage || null,
          userInfo: userData.user.userInfo || null,
          fullName: userData.user.userInfo?.fullName || '',
          bio: userData.user.userInfo?.bio || '',
          phone: userData.user.userInfo?.phone || '',
          location: userData.user.userInfo?.location || '',
          occupation: userData.user.userInfo?.occupation || '',
          interests: userData.user.userInfo?.interests || '',
        };

        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(user));
        
        // Update store
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      // If token is invalid, clear everything
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        set({ user: null, token: null, isAuthenticated: false });
      } else {
        // Network error or other issue - use localStorage as fallback
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const user = JSON.parse(savedProfile);
            set({ user, isAuthenticated: true });
          } catch (e) {
            // Invalid saved data, clear it
            localStorage.removeItem('userProfile');
            set({ user: null, isAuthenticated: false });
          }
        } else {
          set({ user: null, isAuthenticated: false });
        }
      }
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // Load saved profile data only if it matches the current user
      const savedProfile = localStorage.getItem('userProfile');
      let profileData = {};
      
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          // Only use saved profile if it matches the current user
          if (parsed.email === user.email || parsed.username === user.username) {
            profileData = parsed;
          } else {
            // Clear old profile data from different user
            localStorage.removeItem('userProfile');
          }
        } catch (e) {
          // Invalid JSON, clear it
          localStorage.removeItem('userProfile');
        }
      }
      
      const mergedUser = {
        ...user,
        ...profileData,
        // Keep the server data for these fields (don't override with old localStorage data)
        username: user.username,
        email: user.email,
        id: user.id,
        // Use profileImage from server (MongoDB), not localStorage
        profileImage: user.profileImage || null,
        userInfo: user.userInfo || null,
      };
      
      set({ user: mergedUser, token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // Clear any old profile data from localStorage for new user
      localStorage.removeItem('userProfile');
      
      // Set fresh user data with no default profile image
      const newUser = {
        ...user,
        profileImage: null, // No default image for new users
        fullName: '',
        bio: '',
        phone: '',
        location: '',
        occupation: '',
        interests: '',
      };
      
      set({ user: newUser, token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile'); // Clear profile data on logout
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateProfile: async (profileData) => {
    const currentUser = get().user;
    const updatedUser = {
      ...currentUser,
      ...profileData,
      // Ensure username and email are preserved
      username: currentUser.username,
      email: currentUser.email,
      id: currentUser.id,
    };
    
    // Save to localStorage with user identification
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    
    // Update store
    set({ user: updatedUser });
    
    return updatedUser;
  },
}));

export default useAuthStore;

