import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('দয়া করে ইউজারনেম ও পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      
      // Store session details
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));

      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#2d4b3e]">Admin Login</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ইমেইল অথবা মোবাইল নম্বর</label>
            <input 
              required
              type="text" 
              placeholder="Username / Email" 
              className="w-full border p-2.5 rounded-lg focus:outline-brand-green" 
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input 
              required
              type="password" 
              placeholder="Password" 
              className="w-full border p-2.5 rounded-lg focus:outline-brand-green" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-[#2d4b3e] hover:opacity-90 text-white font-bold py-3 rounded-lg transition disabled:opacity-55"
          >
            {loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
