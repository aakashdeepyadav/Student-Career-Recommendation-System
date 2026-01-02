import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useAuthStore from '../store/authStore';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.userInfo?.fullName || user?.fullName || '',
    bio: user?.userInfo?.bio || user?.bio || '',
    phone: user?.userInfo?.phone || user?.phone || '',
    location: user?.userInfo?.location || user?.location || '',
    occupation: user?.userInfo?.occupation || user?.occupation || '',
    interests: user?.userInfo?.interests || user?.interests || '',
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Store the file for upload
      setProfileImageFile(file);
      
      // Show preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');

      // Upload profile image if a new file was selected
      let imageUrl = profileImage;
      if (profileImageFile) {
        try {
          const formData = new FormData();
          formData.append('image', profileImageFile);

          const uploadResponse = await fetch(`${API_URL}/profile/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Don't set Content-Type - browser will set it automatically with boundary for FormData
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
          setProfileImageFile(null); // Clear the file after successful upload
          console.log('Profile image uploaded:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(`Failed to upload image: ${error.message}`);
          setIsSaving(false);
          return;
        }
      }

      // Update profile information (name, bio, etc.)
      try {
        const updateResponse = await fetch(`${API_URL}/profile/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }

        const updateData = await updateResponse.json();
        console.log('Profile updated:', updateData);
      } catch (error) {
        console.error('Error updating profile:', error);
        // Don't fail the whole save if profile update fails
      }

      // Update profile in auth store with new image URL
      if (updateProfile) {
        await updateProfile({
          ...formData,
          profileImage: imageUrl
        });
      }

      // Update local state
      setProfileImage(imageUrl);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/profile/delete-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      setProfileImage(null);
      setProfileImageFile(null);
      
      // Update auth store
      if (updateProfile) {
        await updateProfile({ profileImage: null });
      }

      console.log('Profile image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(`Failed to delete image: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.userInfo?.fullName || user?.fullName || '',
      bio: user?.userInfo?.bio || user?.bio || '',
      phone: user?.userInfo?.phone || user?.phone || '',
      location: user?.userInfo?.location || user?.location || '',
      occupation: user?.userInfo?.occupation || user?.occupation || '',
      interests: user?.userInfo?.interests || user?.interests || '',
    });
    setProfileImage(user?.profileImage || null);
    setProfileImageFile(null);
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-slate-900"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="relative -mt-16 mb-4">
              <div 
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg cursor-pointer group overflow-hidden bg-gray-100"
              >
                {profileImage ? (
                  <img 
                    src={profileImage.startsWith('data:') || profileImage.startsWith('http') 
                      ? profileImage 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${profileImage}`}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                {!profileImage && (
                  <UserCircleIcon className="w-full h-full text-gray-300" />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <CameraIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 mt-2">Click to upload photo</p>
              {profileImage && isEditing && (
                <button
                  onClick={handleDeleteImage}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Edit/Save Buttons */}
            <div className="absolute top-4 right-6">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Username & Email Display */}
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {formData.fullName || formData.username || 'Your Name'}
              </h1>
              <p className="text-slate-500">@{formData.username}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
                  {formData.fullName || 'Not specified'}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <p className="px-4 py-3 bg-slate-100 rounded-xl text-slate-600">
                {formData.username}
                <span className="text-xs text-slate-400 ml-2">(Cannot be changed)</span>
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <p className="px-4 py-3 bg-slate-100 rounded-xl text-slate-600">
                {formData.email}
                <span className="text-xs text-slate-400 ml-2">(Cannot be changed)</span>
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
                  {formData.phone || 'Not specified'}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
                  {formData.location || 'Not specified'}
                </p>
              )}
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="e.g., Student, Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
                  {formData.occupation || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              About Me
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-slate-50 focus:bg-white"
              />
            ) : (
              <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800 min-h-[100px]">
                {formData.bio || 'No bio added yet. Click Edit Profile to add one.'}
              </p>
            )}
          </div>

          {/* Interests */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Interests & Hobbies
            </label>
            {isEditing ? (
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="e.g., Technology, Music, Sports (comma separated)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            ) : (
              <div className="px-4 py-3 bg-slate-50 rounded-xl">
                {formData.interests ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.split(',').map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm"
                      >
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No interests added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;

