import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Lock, Unlock, UserCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = () => {
    axios.get(`${API_URL}/api/admin/users`)
      .then(res => setUsers(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleFreeze = async (user) => {
    const newStatus = user.status === 'frozen' ? 'active' : 'frozen';
    if(confirm(`Are you sure you want to ${newStatus === 'frozen' ? 'freeze' : 'unfreeze'} ${user.name}?`)) {
      try {
        await axios.put(`${API_URL}/api/admin/users/${user.id}/freeze`, { status: newStatus });
        fetchUsers();
      } catch(err) {
        toast.error('Failed to update status');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#2d4b3e]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserCircle size={32} className="text-gray-400" />
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{user.phone}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold uppercase">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'frozen' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => toggleFreeze(user)}
                        className={`p-2 rounded-lg transition-colors ${user.status === 'frozen' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                        title={user.status === 'frozen' ? 'Unfreeze User' : 'Freeze User'}
                      >
                        {user.status === 'frozen' ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
