import React, { useState } from 'react';
import { Mail, Plus, Send, BarChart2 } from 'lucide-react';

export default function EmailMarketing() {
  const [activeTab, setActiveTab] = useState('campaigns'); // campaigns, templates, subscribers
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Email Marketing</h1>
        <button className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90">
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'campaigns' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'templates' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'subscribers' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('subscribers')}
          >
            Subscribers
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'campaigns' && (
            <div>
              <div className="text-gray-500 flex flex-col items-center justify-center py-12">
                <Mail size={48} className="mb-4 text-gray-300" />
                <p>No active campaigns found.</p>
                <button className="mt-4 text-[#2d4b3e] font-medium hover:underline">Create your first campaign</button>
              </div>
            </div>
          )}
          
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition">
                <div className="h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">Welcome Template</div>
                <h3 className="font-bold">Welcome Email</h3>
                <p className="text-sm text-gray-500">Sent when a user registers.</p>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition">
                <div className="h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">Promo Template</div>
                <h3 className="font-bold">Monthly Promo</h3>
                <p className="text-sm text-gray-500">Newsletter format for promos.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'subscribers' && (
            <div>
               <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="p-4 border-b">Email</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-medium">customer1@example.com</td>
                    <td className="p-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded">Active</span></td>
                    <td className="p-4">Oct 10, 2023</td>
                  </tr>
                </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
