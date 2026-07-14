import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export default function CustomerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (res.data.user) {
        localStorage.setItem('customer_user', JSON.stringify(res.data.user));
        toast.success(isLogin ? 'সাফল্যের সাথে সাইন ইন করা হয়েছে' : 'সাফল্যের সাথে অ্যাকাউন্ট তৈরি করা হয়েছে');
        navigate('/customer/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2d4b3e] focus:border-[#2d4b3e]" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                  <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2d4b3e] focus:border-[#2d4b3e]" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2d4b3e] focus:border-[#2d4b3e]" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input required type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2d4b3e] focus:border-[#2d4b3e]" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2d4b3e] hover:bg-[#163428] focus:outline-none">
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#2d4b3e] hover:text-[#163428] font-medium">
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-900">Return to Store</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
