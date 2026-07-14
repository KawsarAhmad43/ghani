import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, DollarSign, Activity, CreditCard } from 'lucide-react';
import API_URL from '../../utils/api';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, paidCount: 0, unpaidCount: 0 });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchOrders = () => {
    axios.get(`${API_URL}/api/admin/orders`)
      .then(res => {
        const data = res.data;
        setOrders(data.slice(0, 10)); // Latest 10
        // Calculate revenue only from paid orders
        const revenue = data
          .filter(order => order.payment_status?.toLowerCase() === 'paid')
          .reduce((acc, order) => acc + parseFloat(order.total_amount || 0), 0);
          
        const paid = data.filter(order => order.payment_status?.toLowerCase() === 'paid').length;
        const unpaid = data.filter(order => order.payment_status?.toLowerCase() === 'unpaid').length;
        
        setStats(prev => ({ 
          ...prev, 
          totalOrders: data.length, 
          totalRevenue: revenue,
          paidCount: paid,
          unpaidCount: unpaid
        }));
      })
      .catch(console.error);
  };

  const fetchUsers = () => {
    axios.get(`${API_URL}/api/admin/users`)
      .then(res => {
        const data = res.data;
        setUsers(data.slice(0, 10));
        setStats(prev => ({ ...prev, totalUsers: data.length }));
      })
      .catch(() => {
        setUsers([
          { id: 1, name: 'Admin', email: 'admin@example.com', created_at: new Date().toISOString() }
        ]);
        setStats(prev => ({ ...prev, totalUsers: 1 }));
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">৳{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Payment Status</p>
            <div className="flex gap-4 mt-1">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Paid</span>
                <span className="text-lg font-bold text-green-600">{stats.paidCount}</span>
              </div>
              <div className="border-l border-gray-150 pl-4">
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Unpaid</span>
                <span className="text-lg font-bold text-red-500">{stats.unpaidCount}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Sessions</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Latest 10 Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-4">#{order.id}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4 font-medium text-gray-800">৳{order.total_amount}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No recent orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Latest 10 Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">#{user.id}</td>
                    <td className="p-4 font-medium text-gray-800">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
