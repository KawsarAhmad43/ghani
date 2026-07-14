import React, { useState } from 'react';
import { Save, User, Lock } from 'lucide-react';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState('profile');
  
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
                  <input type="text" className="w-full border rounded-lg p-2" defaultValue="Admin User" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="w-full border rounded-lg p-2" defaultValue="admin@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="text" className="w-full border rounded-lg p-2" defaultValue="+8801712345678" />
                </div>
              </div>
              
              <button className="flex items-center gap-2 bg-[#2d4b3e] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90">
                <Save size={18} /> Update Profile
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Security Settings</h2>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" className="w-full border rounded-lg p-2" />
                </div>
              </div>
              
              <button className="flex items-center gap-2 bg-[#2d4b3e] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90">
                <Lock size={18} /> Update Password
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
