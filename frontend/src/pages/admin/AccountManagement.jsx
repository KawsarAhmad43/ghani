import React, { useState, useEffect } from 'react';
import { Save, User, Lock } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/profile`);
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      toast.error('Failed to load profile data');
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile.name || !profile.email || !profile.phone) {
      return toast.error('All fields are required');
    }
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/profile`, profile);
      toast.success(res.data.message || 'Profile updated successfully');
      
      // Update local storage if needed
      const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      localStorage.setItem('admin_user', JSON.stringify({ ...storedUser, name: profile.name, email: profile.email, phone: profile.phone }));
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success(res.data.message || 'Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Account Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100">
          <nav className="flex flex-col p-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-[#2d4b3e] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={18} /> Admin Profile
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-2 ${
                activeTab === 'password' 
                  ? 'bg-[#2d4b3e] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lock size={18} /> Change Password
            </button>
          </nav>
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})} 
                  />
                </div>
              </div>
              
              <button 
                onClick={handleProfileUpdate} 
                disabled={loading}
                className="flex items-center gap-2 bg-[#2d4b3e] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
              >
                <Save size={18} /> {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Security Settings</h2>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={passwords.currentPassword}
                    onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={passwords.newPassword}
                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full border rounded-lg p-2 focus:outline-brand-green" 
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              
              <button 
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="flex items-center gap-2 bg-[#2d4b3e] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
              >
                <Lock size={18} /> {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
