import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, User, LogOut, Plus, MessageSquare, Star, Globe, Search, CheckCircle2, Clock, Truck, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviewForm, setReviewForm] = useState({ product_id: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', is_default: false });

  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');

  const getFormattedOrderId = (id) => {
    return (100000 + (id * 13579 + 382153) % 900000).toString();
  };

  const findOrderByFormattedId = (formattedId) => {
    return orders.find(o => getFormattedOrderId(o.id) === formattedId.trim());
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('customer_user');
    if (!savedUser) {
      navigate('/customer/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    fetchOrders(parsedUser.phone);
    fetchAddresses(parsedUser.phone);
    fetchReviews(parsedUser.phone);
    fetchProducts();
    
    axios.get(`${API_URL}/api/profile/${parsedUser.phone}`).then(res => {
      setUser(prev => ({ ...prev, loyalty_points: res.data.loyalty_points }));
    }).catch(console.error);
  }, [navigate]);

  const fetchOrders = (phone) => {
    axios.get(`${API_URL}/api/customer/orders/${phone}`)
      .then(res => setOrders(res.data))
      .catch(console.error);
  };

  const fetchAddresses = (phone) => {
    axios.get(`${API_URL}/api/customer/addresses/${phone}`)
      .then(res => setAddresses(res.data))
      .catch(console.error);
  };

  const fetchReviews = (phone) => {
    axios.get(`${API_URL}/api/customer/reviews/${phone}`)
      .then(res => setReviews(res.data))
      .catch(console.error);
  };

  const fetchProducts = () => {
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        if (res.data.length > 0) {
          setReviewForm(prev => ({ ...prev, product_id: res.data[0].id }));
        }
      })
      .catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_user');
    navigate('/customer/login');
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await axios.put(`${API_URL}/api/customer/addresses/${editingAddressId}`, {
          ...newAddress,
          user_phone: user.phone
        });
      } else {
        await axios.post(`${API_URL}/api/customer/addresses`, {
          ...newAddress,
          user_phone: user.phone
        });
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      fetchAddresses(user.phone);
      setNewAddress({ label: 'Home', address: '', is_default: false });
      toast.success(editingAddressId ? 'ঠিকানা সফলভাবে আপডেট করা হয়েছে' : 'ঠিকানা সফলভাবে সংরক্ষণ করা হয়েছে');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handleEditAddress = (addr) => {
    setNewAddress({ label: addr.label, address: addr.address, is_default: addr.is_default === 1 || addr.is_default === true });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  const handleSetDefaultAddress = async (addr) => {
    try {
      await axios.put(`${API_URL}/api/customer/addresses/${addr.id}`, {
        label: addr.label,
        address: addr.address,
        is_default: true,
        user_phone: user.phone
      });
      fetchAddresses(user.phone);
      toast.success('ডিফল্ট ঠিকানা সেট করা হয়েছে');
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('আপনি কি এই ঠিকানাটি মুছে ফেলতে চান?')) {
      try {
        await axios.delete(`${API_URL}/api/customer/addresses/${id}`);
        fetchAddresses(user.phone);
        toast.success('ঠিকানা সফলভাবে মুছে ফেলা হয়েছে');
      } catch (err) {
        toast.error('Failed to delete address');
      }
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.product_id || !reviewForm.comment) {
      toast.error('দয়া করে সবগুলি ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`${API_URL}/api/reviews`, {
        product_id: parseInt(reviewForm.product_id),
        customer_name: user.name,
        phone: user.phone,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      });
      toast.success('আপনার রিভিউটি সফলভাবে সাবমিট হয়েছে এবং মডারেশনের জন্য পাঠানো হয়েছে!');
      setReviewForm({ product_id: products[0]?.id || '', rating: 5, comment: '' });
      fetchReviews(user.phone);
    } catch (err) {
      toast.error('রিভিউ সাবমিট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'track', label: 'Track Order', icon: Search },
    { id: 'address', label: 'Address Book', icon: MapPin },
    { id: 'reviews', label: 'Product Reviews', icon: MessageSquare },
    { id: 'loyalty', label: 'Loyalty Points', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-[#163428]">Ghani Store</Link>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <aside className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <nav className="flex flex-col">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-l-4 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-[#2d4b3e] bg-gray-50 text-[#2d4b3e]' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-6 py-4 text-sm font-medium border-l-4 border-transparent text-[#2d4b3e] hover:bg-gray-50 hover:text-brand-green border-t border-gray-100 transition-colors mt-auto"
                >
                  <Globe size={18} />
                  Redirect to Website (ওয়েবসাইটে ফিরে যান)
                </Link>
              </nav>
            </div>
          </aside>

          <main className="md:col-span-9">
            
            {activeTab === 'loyalty' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <h2 className="text-xl font-bold mb-6 text-left">Loyalty Card</h2>
                <div className="max-w-md mx-auto bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white shadow-xl transform transition hover:scale-105">
                  <h3 className="text-2xl font-bold mb-2 tracking-wide uppercase">GHANI PREMIUM</h3>
                  <p className="text-yellow-100 mb-8">{user.name}</p>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-left">
                      <p className="text-sm text-yellow-100 uppercase tracking-wider">Available Points</p>
                      <p className="text-4xl font-extrabold">{user.loyalty_points || 0}</p>
                    </div>
                    <Star size={48} className="opacity-80" />
                  </div>
                </div>
                <p className="mt-8 text-sm text-gray-500 max-w-sm mx-auto">
                  Earn points on every purchase and use them for discounts on future orders!
                </p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Order History</h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                  {['all', 'pending', 'confirmed', 'shipped', 'rejected', 'on_delivery'].map(statusFilter => (
                    <button
                      key={statusFilter}
                      onClick={() => setOrderFilter(statusFilter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                        orderFilter === statusFilter
                          ? 'bg-[#2d4b3e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
                      }`}
                    >
                      {statusFilter === 'all' ? 'All' : statusFilter === 'on_delivery' ? 'On Delivery' : statusFilter === 'shipped' ? 'Completed/Shipped' : statusFilter}
                    </button>
                  ))}
                </div>

                {orders.filter(order => orderFilter === 'all' || order.status === orderFilter).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No orders found matching the filter.</p>
                    <Link to="/" className="text-[#2d4b3e] font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.filter(order => orderFilter === 'all' || order.status === orderFilter).map(order => (
                      <div key={order.id} className="border rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">Order #{getFormattedOrderId(order.id)}</h3>
                              <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-650">Total: <span className="font-bold text-[#163428]">৳{order.total_amount}</span></p>
                          </div>
                          <div className="flex gap-2 h-fit">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              order.status === 'on_delivery' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status === 'shipped' ? 'Completed/Shipped' : order.status === 'on_delivery' ? 'On Delivery' : order.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : order.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Products:</p>
                            <ul className="space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="text-xs text-gray-700">
                                  {item.product_name} {item.variant_name ? `(${item.variant_name})` : ''} <span className="text-gray-400">x</span> {item.quantity} - <span className="font-medium text-gray-800">৳{item.price}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Track Order Button - only if status is not shipped/completed */}
                        {order.status !== 'shipped' && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => {
                                setTrackedOrder(order);
                                setSearchOrderId(getFormattedOrderId(order.id));
                                setActiveTab('track');
                              }}
                              className="px-4 py-1.5 bg-[#2d4b3e] text-white rounded-lg text-xs font-semibold hover:bg-[#163428] transition-colors"
                            >
                              Track this Order (অর্ডার ট্র্যাক করুন)
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'address' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Address Book</h2>
                  <button onClick={() => { setEditingAddressId(null); setNewAddress({ label: 'Home', address: '', is_default: false }); setShowAddressForm(!showAddressForm); }} className="flex items-center gap-1 text-sm bg-[#2d4b3e] text-white px-3 py-1.5 rounded hover:bg-[#163428]">
                    <Plus size={16} /> Add New
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={submitAddress} className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-bold text-sm text-[#2d4b3e]">{editingAddressId ? 'ঠিকানা এডিট করুন' : 'নতুন ঠিকানা যোগ করুন'}</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Home, Office)</label>
                      <input required type="text" className="w-full border rounded-lg p-2" value={newAddress.label} onChange={e=>setNewAddress({...newAddress, label: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <textarea required className="w-full border rounded-lg p-2" rows="2" value={newAddress.address} onChange={e=>setNewAddress({...newAddress, address: e.target.value})}></textarea>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_default" checked={newAddress.is_default} onChange={e=>setNewAddress({...newAddress, is_default: e.target.checked})} />
                      <label htmlFor="is_default" className="text-sm font-medium text-gray-700">Set as Default Shipping Address</label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-[#2d4b3e] text-white rounded-lg text-sm">Save Address</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 col-span-2">No addresses found.</p>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className={`border rounded-lg p-4 relative flex flex-col justify-between ${addr.is_default ? 'border-[#2d4b3e] bg-[#ceeac5]/10' : 'border-gray-200'}`}>
                        {addr.is_default && <span className="absolute top-2 right-2 text-[10px] font-bold bg-[#2d4b3e] text-white px-2 py-0.5 rounded-full">DEFAULT</span>}
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{addr.label}</h3>
                          <p className="text-sm text-gray-650 leading-relaxed mb-4">{addr.address}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-2 text-xs">
                          <button onClick={() => handleEditAddress(addr)} className="text-blue-600 font-bold hover:underline">Edit</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-650 font-bold hover:underline">Delete</button>
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefaultAddress(addr)} className="text-[#2d4b3e] font-bold hover:underline ml-auto">Set Default</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6">My Profile</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-gray-50" value={user.name} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-gray-50" value={user.phone} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-gray-50" value={user.email || 'N/A'} readOnly />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'track' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Track Your Order (অর্ডার ট্র্যাকিং)</h2>
                </div>

                {/* Search bar */}
                <div className="flex gap-2 max-w-md mb-8">
                  <input
                    type="text"
                    placeholder="Enter 6-digit Order ID (e.g. 495732)"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#2d4b3e] focus:border-[#2d4b3e]"
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      const found = findOrderByFormattedId(searchOrderId);
                      if (found) {
                        setTrackedOrder(found);
                      } else {
                        toast.error('Order not found. Please check the ID.');
                      }
                    }}
                    className="bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#163428]"
                  >
                    Search
                  </button>
                </div>

                {trackedOrder ? (
                  <div>
                    {/* Order summary card */}
                    <div className="border border-green-100 bg-[#ceeac5]/5 rounded-lg p-4 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Order #{getFormattedOrderId(trackedOrder.id)}</h3>
                          <p className="text-xs text-gray-500">Ordered on: {new Date(trackedOrder.created_at).toLocaleString()}</p>
                        </div>
                        <div className="sm:text-right text-left">
                          <p className="text-xs text-gray-500">Total Bill:</p>
                          <p className="text-lg font-bold text-[#163428]">৳{trackedOrder.total_amount}</p>
                        </div>
                      </div>

                      {/* Display Items */}
                      {trackedOrder.items && trackedOrder.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Products in this order:</p>
                          <ul className="space-y-1">
                            {trackedOrder.items.map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-700">
                                {item.product_name} {item.variant_name ? `(${item.variant_name})` : ''} <span className="text-gray-400">x</span> {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Rejected status notice */}
                    {trackedOrder.status === 'rejected' && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="text-red-650 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-red-800">Order Cancelled/Rejected (অর্ডারটি বাতিল করা হয়েছে)</h4>
                          <p className="text-sm text-red-700 mt-1">This order has been cancelled or rejected by the admin. Please contact support if you believe this is a mistake.</p>
                        </div>
                      </div>
                    )}

                    {/* Step timeline */}
                    <div className="relative pl-8 border-l border-gray-200 space-y-8 py-2 ml-4">
                      {/* Step 1: Ordered */}
                      <div className="relative">
                        <span className="absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#2d4b3e] text-white">
                          <CheckCircle2 size={16} />
                        </span>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Ordered (অর্ডার করা হয়েছে)</h4>
                          <p className="text-xs text-gray-500 mt-0.5">The order has been submitted successfully.</p>
                          <span className="text-[10px] bg-gray-150 text-gray-600 px-2 py-0.5 rounded-full inline-block mt-1">
                            {new Date(trackedOrder.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Step 2: Order Confirmed */}
                      <div className="relative">
                        <span className={`absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full ${
                          ['confirmed', 'on_delivery', 'shipped'].includes(trackedOrder.status)
                            ? 'bg-[#2d4b3e] text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {['confirmed', 'on_delivery', 'shipped'].includes(trackedOrder.status) ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          )}
                        </span>
                        <div>
                          <h4 className={`font-bold text-sm ${['confirmed', 'on_delivery', 'shipped'].includes(trackedOrder.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                            Order Confirmed (অর্ডার নিশ্চিত করা হয়েছে)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">Admin has reviewed and confirmed your order.</p>
                        </div>
                      </div>

                      {/* Step 3: Processing for Delivery */}
                      <div className="relative">
                        <span className={`absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full ${
                          ['on_delivery', 'shipped'].includes(trackedOrder.status)
                            ? 'bg-[#2d4b3e] text-white'
                            : trackedOrder.status === 'confirmed'
                            ? 'border-2 border-[#2d4b3e] text-[#2d4b3e] bg-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {['on_delivery', 'shipped'].includes(trackedOrder.status) ? (
                            <CheckCircle2 size={16} />
                          ) : trackedOrder.status === 'confirmed' ? (
                            <Clock size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          )}
                        </span>
                        <div>
                          <h4 className={`font-bold text-sm ${['confirmed', 'on_delivery', 'shipped'].includes(trackedOrder.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                            Processing for Delivery (প্রসেসিং করা হচ্ছে)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">Your order is being processed and packaged for courier delivery.</p>
                        </div>
                      </div>

                      {/* Step 4: On Delivery */}
                      <div className="relative">
                        <span className={`absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full ${
                          trackedOrder.status === 'shipped'
                            ? 'bg-[#2d4b3e] text-white'
                            : trackedOrder.status === 'on_delivery'
                            ? 'border-2 border-[#2d4b3e] text-[#2d4b3e] bg-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {trackedOrder.status === 'shipped' ? (
                            <CheckCircle2 size={16} />
                          ) : trackedOrder.status === 'on_delivery' ? (
                            <Truck size={14} className="animate-pulse" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          )}
                        </span>
                        <div>
                          <h4 className={`font-bold text-sm ${['on_delivery', 'shipped'].includes(trackedOrder.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                            On Delivery (ডেলিভারি চলমান)
                          </h4>
                          {['on_delivery', 'shipped'].includes(trackedOrder.status) ? (
                            <div className="space-y-1 mt-1.5 text-xs text-gray-650">
                              <p>Your package is on its way to you.</p>
                              <div className="bg-gray-50 border border-gray-150 rounded-lg p-2.5 mt-2 space-y-1 w-fit">
                                <p className="font-semibold text-gray-800">Courier Info:</p>
                                <p>Courier Agent: <span className="font-bold text-gray-900">{trackedOrder.courier_id === 1 ? 'Steadfast' : trackedOrder.courier_id === 2 ? 'Pathao' : 'Local Courier'}</span></p>
                                <p>Tracking Code: <span className="font-mono font-bold text-[#2d4b3e] select-all bg-white px-1.5 py-0.5 rounded border">{trackedOrder.tracking_number || 'N/A'}</span></p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">Your package is waiting to be handed over to the courier.</p>
                          )}
                        </div>
                      </div>

                      {/* Step 5: Completed/Shipped */}
                      <div className="relative">
                        <span className={`absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full ${
                          trackedOrder.status === 'shipped'
                            ? 'bg-[#2d4b3e] text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {trackedOrder.status === 'shipped' ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          )}
                        </span>
                        <div>
                          <h4 className={`font-bold text-sm ${trackedOrder.status === 'shipped' ? 'text-gray-900' : 'text-gray-400'}`}>
                            Completed/Shipped (ডেলিভারি সম্পন্ন)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">Your package has been successfully delivered.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-gray-250 rounded-lg max-w-lg mx-auto">
                    <Search size={48} className="mx-auto mb-4 opacity-35 text-gray-400" />
                    <p className="text-sm font-medium">Please enter your 6-digit Order ID above</p>
                    <p className="text-xs text-gray-400 mt-1">Or click "Track this Order" from your Order History.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit Review Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold mb-4 font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>একটি রিভিউ লিখুন (Write Review)</h2>
                  <form onSubmit={submitReview} className="space-y-4 max-w-2xl font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পণ্য সিলেক্ট করুন</label>
                        <select
                          required
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e] focus:border-[#2d4b3e]"
                          value={reviewForm.product_id}
                          onChange={e => setReviewForm({ ...reviewForm, product_id: e.target.value })}
                        >
                          <option value="">পণ্য নির্বাচন করুন</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">রেটিং (Rating)</label>
                        <div className="flex items-center gap-1.5 py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={24}
                                className={
                                  star <= reviewForm.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">মতামত / মন্তব্য</label>
                      <textarea
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e] focus:border-[#2d4b3e]"
                        placeholder="পণ্য সম্পর্কে আপনার মন্তব্যটি এখানে লিখুন..."
                        rows="3"
                        value={reviewForm.comment}
                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-[#2d4b3e] text-white rounded-lg font-bold text-sm hover:bg-[#163428] transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? 'পাঠানো হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                    </button>
                  </form>
                </div>

                {/* Reviews History List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold mb-6 font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আপনার রিভিউ সমূহ (Your Reviews)</h2>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      <MessageSquare size={40} className="mx-auto mb-3 opacity-50 text-gray-400" />
                      <p>আপনি এখনো কোনো রিভিউ দেননি।</p>
                    </div>
                  ) : (
                    <div className="space-y-4 font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {reviews.map(rev => (
                        <div key={rev.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{rev.product_name || 'Product'}</h3>
                              <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                rev.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : rev.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rev.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
