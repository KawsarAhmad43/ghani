import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Save, Clock, Send, Settings, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

export default function CourierManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('forward');
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('steadfast');
  const [loading, setLoading] = useState(false);

  const getFormattedOrderId = (id) => {
    return (100000 + (id * 13579 + 382153) % 900000).toString();
  };

  // Settings configs state
  const [configs, setConfigs] = useState({
    pathao_store_id: '',
    pathao_client_id: '',
    pathao_client_secret: '',
    steadfast_api_key: '',
    steadfast_secret_key: '',
    courier_auto_forward: 'false',
    courier_auto_time: '16:00',
    courier_auto_default: 'steadfast'
  });

  const fetchOrders = () => {
    axios.get(`${API_URL}/api/admin/orders`)
      .then(res => {
        setAllOrders(res.data);
        // Filter orders that are confirmed or pending and don't have tracking number yet
        const readyOrders = res.data.filter(o => 
          (o.status === 'confirmed' || o.status === 'pending') && !o.tracking_number
        );
        setOrders(readyOrders);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
      });
  };

  const fetchConfigs = () => {
    axios.get(`${API_URL}/api/admin/settings`)
      .then(res => {
        setConfigs(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => {
        console.error('Failed to load configurations:', err);
      });
  };

  useEffect(() => {
    fetchOrders();
    fetchConfigs();
  }, []);

  const handleSaveConfigs = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/settings`, configs);
      toast.success('Courier configuration saved successfully!');
      fetchConfigs();
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleForwardOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast.warning('Please select at least one order to forward.');
      return;
    }
    if (selectedCourier === 'Select Courier') {
      toast.warning('Please select a valid courier.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/orders/forward`, {
        orderIds: selectedOrderIds,
        courier: selectedCourier
      });

      if (res.data.success) {
        const successes = res.data.results.filter(r => r.success);
        const failures = res.data.results.filter(r => !r.success);

        if (successes.length > 0) {
          toast.success(`Successfully forwarded ${successes.length} orders to ${selectedCourier.toUpperCase()}!`);
        }
        if (failures.length > 0) {
          toast.error(`Failed to forward ${failures.length} orders. Check credentials.`);
        }

        setSelectedOrderIds([]);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to forward orders to courier.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(o => o.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Courier Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'forward' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('forward')}
          >
            <Send size={16} /> Forward Orders
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'forwarded' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('forwarded')}
          >
            <Truck size={16} /> Forwarded Orders
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'config' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-550 hover:text-gray-700'}`}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={16} /> Courier API Configurations
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'schedule' ? 'border-b-2 border-[#2d4b3e] text-[#2d4b3e]' : 'text-gray-550 hover:text-gray-700'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Clock size={16} /> Auto Schedule
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'forward' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Select orders below to manually forward them to configured couriers (Pathao/Steadfast).</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-t">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                    <tr>
                      <th className="p-4 border-b w-12 text-center">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                          checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4 border-b">Order ID</th>
                      <th className="p-4 border-b">Customer Details</th>
                      <th className="p-4 border-b">Amount</th>
                      <th className="p-4 border-b">Order Status</th>
                      <th className="p-4 border-b">Risk Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                          />
                        </td>
                        <td className="p-4 font-bold text-gray-900">{getFormattedOrderId(order.id)}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        </td>
                        <td className="p-4 font-bold text-[#163428]">৳{order.total_amount}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.buyer_success_rate !== null ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              Number(order.buyer_success_rate) >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {order.buyer_success_rate}% Success
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">New / No records</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                          No pending/confirmed orders available to forward.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {orders.length > 0 && (
                <div className="pt-4 flex items-center gap-4">
                  <select 
                    className="border p-2.5 rounded-lg bg-gray-50 font-semibold text-sm outline-none cursor-pointer focus:border-[#2d4b3e]"
                    value={selectedCourier}
                    onChange={e => setSelectedCourier(e.target.value)}
                  >
                    <option value="steadfast">Steadfast Courier</option>
                    <option value="pathao">Pathao Courier</option>
                  </select>
                  <button 
                    onClick={handleForwardOrders}
                    disabled={loading || selectedOrderIds.length === 0}
                    className="bg-[#2d4b3e] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 text-sm shadow-sm"
                  >
                    {loading ? 'Forwarding...' : `Forward Selected (${selectedOrderIds.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfigs} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6 space-y-4 shadow-sm bg-gray-50/50">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-gray-800"><Truck /> Pathao API Config</h3>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Store ID</label>
                  <input 
                    type="text" 
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                    value={configs.pathao_store_id}
                    onChange={e => setConfigs({ ...configs, pathao_store_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Client ID</label>
                  <input 
                    type="text" 
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                    value={configs.pathao_client_id}
                    onChange={e => setConfigs({ ...configs, pathao_client_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Client Secret</label>
                  <input 
                    type="password" 
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                    value={configs.pathao_client_secret}
                    onChange={e => setConfigs({ ...configs, pathao_client_secret: e.target.value })}
                  />
                </div>
              </div>

              <div className="border rounded-xl p-6 space-y-4 shadow-sm bg-gray-50/50">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-gray-800"><Truck /> Steadfast API Config</h3>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">API Key</label>
                  <input 
                    type="text" 
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                    value={configs.steadfast_api_key}
                    onChange={e => setConfigs({ ...configs, steadfast_api_key: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Secret Key</label>
                  <input 
                    type="password" 
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                    value={configs.steadfast_secret_key}
                    onChange={e => setConfigs({ ...configs, steadfast_secret_key: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-[#2d4b3e] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-opacity-90 shadow-sm text-sm">
                  <Save size={18} /> Save Configs
                </button>
              </div>
            </form>
          )}

          {activeTab === 'schedule' && (
            <form onSubmit={handleSaveConfigs} className="max-w-md border rounded-xl p-6 space-y-4 shadow-sm bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Automated Forwarding</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Automatically push all pending verified orders to a designated courier at a specific time daily.</p>
              
              <div className="flex items-center gap-4 py-4 border-y border-gray-150">
                <span className="font-bold text-sm text-gray-700">Enable Auto-Forwarding</span>
                <label className="relative inline-flex items-center cursor-pointer ml-auto">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.courier_auto_forward === 'true'}
                    onChange={e => setConfigs({ ...configs, courier_auto_forward: e.target.checked ? 'true' : 'false' })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d4b3e]"></div>
                </label>
              </div>

              {configs.courier_auto_forward === 'true' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Scheduled Time (Daily)</label>
                    <input 
                      type="time" 
                      className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#2d4b3e]" 
                      value={configs.courier_auto_time}
                      onChange={e => setConfigs({ ...configs, courier_auto_time: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Default Courier</label>
                    <select 
                      className="w-full border p-2.5 rounded-lg bg-white outline-none cursor-pointer focus:ring-1 focus:ring-[#2d4b3e]"
                      value={configs.courier_auto_default}
                      onChange={e => setConfigs({ ...configs, courier_auto_default: e.target.value })}
                    >
                      <option value="steadfast">Steadfast Courier</option>
                      <option value="pathao">Pathao Courier</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="bg-[#2d4b3e] text-white px-4 py-2.5 rounded-lg font-bold w-full mt-4 shadow-sm text-sm hover:bg-opacity-90">
                Save Schedule Settings
              </button>
            </form>
          )}

          {activeTab === 'forwarded' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4 font-medium">List of orders successfully forwarded to delivery agents / couriers.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-t">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                    <tr>
                      <th className="p-4 border-b">Order ID</th>
                      <th className="p-4 border-b">Customer Details</th>
                      <th className="p-4 border-b">Amount</th>
                      <th className="p-4 border-b">Courier</th>
                      <th className="p-4 border-b">Tracking Number</th>
                      <th className="p-4 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allOrders.filter(o => o.tracking_number).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-bold text-gray-900">{getFormattedOrderId(order.id)}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        </td>
                        <td className="p-4 font-bold text-[#163428]">৳{order.total_amount}</td>
                        <td className="p-4 font-semibold capitalize text-gray-700">
                          {order.courier_id === 1 ? 'Steadfast' : order.courier_id === 2 ? 'Pathao' : 'Local Courier'}
                        </td>
                        <td className="p-4 font-mono font-bold text-sm text-[#2d4b3e] select-all">
                          {order.tracking_number}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                            order.status === 'on_delivery' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {order.status === 'on_delivery' ? 'On Delivery' : order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {allOrders.filter(o => o.tracking_number).length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                          No forwarded orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
