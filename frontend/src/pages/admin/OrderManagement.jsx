import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit, FileText, Download, Plus, X, Trash2, Printer } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

export default function OrderManagement() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const getFormattedOrderId = (id) => {
    return (100000 + (id * 13579 + 382153) % 900000).toString();
  };
  
  // Modal State for Manual Order
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [manualPriceType, setManualPriceType] = useState('variant'); // 'variant' or 'custom'
  const [manualDeliveryCharge, setManualDeliveryCharge] = useState(60);
  const [manualOrder, setManualOrder] = useState({
    customer_name: '',
    phone: '',
    address: '',
    total_amount: 0,
    items: [{ product_id: '', variant_id: '', quantity: 1, price: 0 }]
  });

  // Fetch all products on mount
  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProductsList(res.data);
        if (res.data && res.data.length > 0) {
          handleProductSelect(res.data[0].id);
        }
      })
      .catch(err => console.error('Failed to load products list:', err));
  }, []);

  const handleProductSelect = async (productId) => {
    if (!productId) return;
    try {
      const res = await axios.get(`${API_URL}/api/products/${productId}`);
      setSelectedProductDetails(res.data);
      const defaultVariant = res.data.variants && res.data.variants.length > 0 ? res.data.variants[0] : null;
      const defaultPrice = defaultVariant ? defaultVariant.price : res.data.price;
      
      const newItems = [{
        product_id: parseInt(productId),
        variant_id: defaultVariant ? defaultVariant.id : '',
        quantity: 1,
        price: Number(defaultPrice)
      }];

      setManualOrder(prev => {
        const subtotal = newItems[0].price * newItems[0].quantity;
        return {
          ...prev,
          items: newItems,
          total_amount: subtotal + Number(manualDeliveryCharge)
        };
      });
    } catch (err) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleVariantSelect = (variantId) => {
    if (!selectedProductDetails) return;
    const variant = selectedProductDetails.variants.find(v => v.id === parseInt(variantId));
    if (!variant) return;

    setManualOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[0].variant_id = parseInt(variantId);
      if (manualPriceType === 'variant') {
        updatedItems[0].price = Number(variant.price);
      }
      const subtotal = updatedItems[0].price * updatedItems[0].quantity;
      return {
        ...prev,
        items: updatedItems,
        total_amount: subtotal + Number(manualDeliveryCharge)
      };
    });
  };

  const handleManualQuantityChange = (qty) => {
    const quantity = Math.max(1, parseInt(qty) || 1);
    setManualOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[0].quantity = quantity;
      const subtotal = updatedItems[0].price * quantity;
      return {
        ...prev,
        items: updatedItems,
        total_amount: subtotal + Number(manualDeliveryCharge)
      };
    });
  };

  const handleManualPriceChange = (price) => {
    const pVal = Math.max(0, parseFloat(price) || 0);
    setManualOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[0].price = pVal;
      const subtotal = pVal * updatedItems[0].quantity;
      return {
        ...prev,
        items: updatedItems,
        total_amount: subtotal + Number(manualDeliveryCharge)
      };
    });
  };

  const handleManualDeliveryChange = (charge) => {
    const cVal = Math.max(0, parseFloat(charge) || 0);
    setManualDeliveryCharge(cVal);
    setManualOrder(prev => {
      const item = prev.items[0] || { price: 0, quantity: 1 };
      const subtotal = item.price * item.quantity;
      return {
        ...prev,
        total_amount: subtotal + cVal
      };
    });
  };

  // Modal State for Printable Invoice
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrderIds.length} selected orders?`)) {
      try {
        await Promise.all(selectedOrderIds.map(id => axios.delete(`${API_URL}/api/admin/orders/${id}`)));
        toast.success('Selected orders deleted successfully!');
        setSelectedOrderIds([]);
        fetchOrders();
      } catch (err) {
        toast.error('Failed to delete some orders');
      }
    }
  };

  const handleBulkStatusChange = async (field, value) => {
    try {
      await Promise.all(selectedOrderIds.map(async (id) => {
        const order = orders.find(o => o.id === id);
        if (order) {
          const payload = {
            status: field === 'status' ? value : order.status,
            payment_status: field === 'payment_status' ? value : order.payment_status
          };
          await axios.put(`${API_URL}/api/admin/orders/${id}/status`, payload);
        }
      }));
      toast.success('Selected orders updated successfully!');
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update some orders');
    }
  };

  const fetchOrders = () => {
    axios.get(`${API_URL}/api/admin/orders`)
      .then(res => setOrders(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, field, value, currentStatus, currentPayment) => {
    try {
      const payload = {
        status: field === 'status' ? value : currentStatus,
        payment_status: field === 'payment_status' ? value : currentPayment
      };
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, payload);
      fetchOrders();
    } catch(err) {
      toast.error('Failed to update order');
    }
  };

  const handleManualOrderSubmit = async (e) => {
    e.preventDefault();
    if (!manualOrder.customer_name || !manualOrder.phone || !manualOrder.address || !manualOrder.items[0].product_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/orders`, manualOrder);
      setIsManualModalOpen(false);
      fetchOrders();
      toast.success('Manual Order created successfully!');
      // Reset manual order fields
      setManualOrder({
        customer_name: '',
        phone: '',
        address: '',
        total_amount: 0,
        items: [{ product_id: '', variant_id: '', quantity: 1, price: 0 }],
        advance_payment_method: '',
        advance_transaction_id: ''
      });
      setSelectedProductDetails(null);
      setManualPriceType('variant');
    } catch(err) {
      toast.error('Error creating order');
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.warning('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Total Amount (৳)', 'Status', 'Payment Status', 'Event ID', 'FBCLID', 'UTM Source', 'UTM Medium', 'UTM Campaign'];
    const rows = filteredOrders.map(o => [
      `"${getFormattedOrderId(o.id)}"`,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      o.total_amount,
      `"${o.status}"`,
      `"${o.payment_status}"`,
      `"${o.event_id || ''}"`,
      `"${o.fbclid || ''}"`,
      `"${o.utm_source || ''}"`,
      `"${o.utm_medium || ''}"`,
      `"${o.utm_campaign || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported successfully as CSV!');
  };

  const handleOpenInvoice = async (orderId) => {
    setInvoiceLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders/${orderId}`);
      setActiveInvoiceOrder(res.data);
      setIsInvoiceModalOpen(true);
    } catch (err) {
      toast.error('Failed to load order details for invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const formattedId = getFormattedOrderId(o.id);
    const matchSearch = o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        o.phone.includes(searchQuery) ||
                        o.id.toString() === searchQuery ||
                        formattedId.includes(searchQuery) ||
                        (o.advance_transaction_id && o.advance_transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchDate = dateFilter === '' || new Date(o.created_at).toISOString().split('T')[0] === dateFilter;
    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsManualModalOpen(true)} className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90">
            <Plus size={18} /> Create Manual Order
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50" title="Export to CSV">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-4 bg-gray-50">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Name, or Phone..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#2d4b3e]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Date:</span>
            <input 
              type="date" 
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4b3e]"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
          
          {selectedOrderIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-800 font-semibold shadow-sm w-full animate-fade-in mt-2">
              <span>Selected {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'order' : 'orders'}</span>
              
              <div className="flex flex-wrap items-center gap-3 ml-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-bold">Status:</span>
                  <select 
                    className="text-xs font-bold border rounded p-1 bg-white cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleBulkStatusChange('status', e.target.value);
                    }}
                  >
                    <option value="">-- Change Status --</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="on_delivery">On Delivery</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-bold">Payment:</span>
                  <select 
                    className="text-xs font-bold border rounded p-1 bg-white cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleBulkStatusChange('payment_status', e.target.value);
                    }}
                  >
                    <option value="">-- Change Payment --</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <button 
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete Selected
                </button>
                <button 
                  onClick={() => setSelectedOrderIds([])}
                  className="text-gray-550 hover:text-gray-800 text-xs underline font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox"
                    className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds(filteredOrders.map(o => o.id));
                      } else {
                        setSelectedOrderIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 w-10">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrderIds([...selectedOrderIds, order.id]);
                        } else {
                          setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{getFormattedOrderId(order.id)}</td>
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{order.customer_name}</div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span>{order.phone}</span>
                      {order.buyer_success_rate !== null && (
                        <span 
                          className={`inline-block px-1.5 py-0.5 text-[9px] font-black rounded-full border ${
                            Number(order.buyer_success_rate) >= 75 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          }`}
                          title={`Steadfast: Success ${order.buyer_success_rate}% | Total: ${order.buyer_total_orders} | Returned: ${order.buyer_failed_orders}`}
                        >
                          {Number(order.buyer_success_rate) >= 75 ? '🟢 Safe' : '🔴 High Risk'} ({order.buyer_success_rate}%)
                        </span>
                      )}
                      {order.advance_transaction_id && (
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full border bg-yellow-50 text-yellow-800 border-yellow-200">
                          TrxID: {order.advance_transaction_id} ({order.advance_payment_method})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#163428]">৳{order.total_amount}</td>
                  <td className="px-6 py-4">
                    <select 
                      className={`text-xs font-bold uppercase px-2 py-1 rounded border-0 cursor-pointer ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                      value={order.payment_status}
                      onChange={(e) => handleStatusChange(order.id, 'payment_status', e.target.value, order.status, order.payment_status)}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={`text-xs font-bold uppercase px-2 py-1 rounded border-0 cursor-pointer ${
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        order.status === 'on_delivery' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, 'status', e.target.value, order.status, order.payment_status)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rejected">Rejected</option>
                      <option value="on_delivery">On Delivery</option>
                      <option value="shipped">Shipped</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenInvoice(order.id)} disabled={invoiceLoading} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1 disabled:opacity-50" title="View Details / Printable Invoice"><FileText size={18} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete" onClick={() => {
                      if(window.confirm(`Delete order ${getFormattedOrderId(order.id)}?`)) {
                        axios.delete(`${API_URL}/api/admin/orders/${order.id}`).then(() => {
                          setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                          fetchOrders();
                          toast.success('Order deleted successfully');
                        }).catch(() => toast.error('Error deleting order'));
                      }
                    }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Order Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Create Manual Order</h2>
              <button onClick={() => setIsManualModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualOrderSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Customer Name *</label>
                  <input required type="text" className="w-full border rounded-lg p-2.5 text-sm" value={manualOrder.customer_name} onChange={e => setManualOrder({...manualOrder, customer_name: e.target.value})} placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number *</label>
                  <input required type="text" className="w-full border rounded-lg p-2.5 text-sm" value={manualOrder.phone} onChange={e => setManualOrder({...manualOrder, phone: e.target.value})} placeholder="017XXXXXXXX" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Delivery Address *</label>
                <textarea required className="w-full border rounded-lg p-2.5 text-sm" rows="2" value={manualOrder.address} onChange={e => setManualOrder({...manualOrder, address: e.target.value})} placeholder="Street address, City"></textarea>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-bold text-sm text-[#2d4b3e]">Product & Variant Selection</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Product *</label>
                    <select 
                      required 
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      value={manualOrder.items[0]?.product_id || ''}
                      onChange={e => handleProductSelect(e.target.value)}
                    >
                      <option value="">-- Choose Product --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProductDetails?.variants && selectedProductDetails.variants.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Variant (Quality/Size) *</label>
                      <select 
                        required
                        className="w-full border rounded-lg p-2.5 text-sm bg-white"
                        value={manualOrder.items[0]?.variant_id || ''}
                        onChange={e => handleVariantSelect(e.target.value)}
                      >
                        {selectedProductDetails.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.name} (৳{v.price})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Quantity</label>
                    <input 
                      required 
                      type="number" 
                      min="1"
                      className="w-full border rounded-lg p-2.5 text-sm" 
                      value={manualOrder.items[0]?.quantity || 1} 
                      onChange={e => handleManualQuantityChange(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Price Configuration</label>
                    <select 
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      value={manualPriceType}
                      onChange={e => {
                        setManualPriceType(e.target.value);
                        if (e.target.value === 'variant') {
                          const item = manualOrder.items[0];
                          if (selectedProductDetails) {
                            const variant = selectedProductDetails.variants?.find(v => v.id === item.variant_id);
                            const price = variant ? variant.price : selectedProductDetails.price;
                            handleManualPriceChange(price);
                          }
                        }
                      }}
                    >
                      <option value="variant">Product Variant Price</option>
                      <option value="custom">Custom Price</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Price (৳)</label>
                    <input 
                      required 
                      type="number" 
                      disabled={manualPriceType === 'variant'}
                      className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 disabled:opacity-60" 
                      value={manualOrder.items[0]?.price || 0} 
                      onChange={e => handleManualPriceChange(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Advance Payment Method</label>
                    <select 
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      value={manualOrder.advance_payment_method || ''}
                      onChange={e => setManualOrder({...manualOrder, advance_payment_method: e.target.value})}
                    >
                      <option value="">None</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Advance Transaction ID (TrxID)</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg p-2.5 text-sm" 
                      placeholder="e.g. 98GKL22356"
                      value={manualOrder.advance_transaction_id || ''}
                      onChange={e => setManualOrder({...manualOrder, advance_transaction_id: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Delivery Charge (৳)</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full border rounded-lg p-2.5 text-sm" 
                      value={manualDeliveryCharge} 
                      onChange={e => handleManualDeliveryChange(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Grand Total (৳)</label>
                    <div className="w-full border rounded-lg p-2.5 text-sm font-bold bg-green-50 text-green-800 text-center">
                      ৳{manualOrder.total_amount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#2d4b3e] text-white rounded-lg hover:opacity-90 text-sm font-semibold">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {isInvoiceModalOpen && activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-8">
            {/* Modal Actions */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 print:hidden">
              <h2 className="text-lg font-bold text-gray-800">Order Invoice (A4 Printable Layout)</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 shadow-sm"
                >
                  <Printer size={16} /> Print Invoice
                </button>
                <button 
                  onClick={() => setIsInvoiceModalOpen(false)} 
                  className="text-gray-550 hover:text-gray-800 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Invoice Printable Viewport */}
            <div className="p-10 bg-white text-gray-900 font-sans print:p-0 flex-grow" id="printable-invoice">
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-invoice, #printable-invoice * {
                    visibility: visible;
                  }
                  #printable-invoice {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                  }
                  .print\\:hidden {
                    display: none !important;
                  }
                }
              `}</style>
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#2d4b3e] flex items-center justify-center text-white font-bold text-lg">G</div>
                    <span className="text-2xl font-black text-[#2d4b3e] tracking-tight">Ghani Sorisha Oil</span>
                  </div>
                  <p className="text-xs text-gray-500">100% Pure Cold Pressed Organic Oil</p>
                  <p className="text-xs text-gray-500">Dhaka, Bangladesh | Phone: 01872-345678</p>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-black text-gray-400 tracking-wider mb-2">INVOICE</h1>
                  <p className="text-xs text-gray-600 font-bold">Invoice #: {getFormattedOrderId(activeInvoiceOrder.id)}</p>
                  <p className="text-xs text-gray-500">Date: {new Date(activeInvoiceOrder.created_at).toLocaleString()}</p>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                  <p className="text-sm font-bold text-gray-800">{activeInvoiceOrder.customer_name}</p>
                  <p className="text-sm text-gray-600 mt-1">Phone: {activeInvoiceOrder.phone}</p>
                  {activeInvoiceOrder.email && !activeInvoiceOrder.email.endsWith('@ghani.com') && (
                    <p className="text-sm text-gray-600">Email: {activeInvoiceOrder.email}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipment Destination</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{activeInvoiceOrder.address}</p>
                  <p className="text-xs text-gray-500 mt-2">Method: {activeInvoiceOrder.advance_transaction_id ? `Cash on Delivery (Advance Paid via ${activeInvoiceOrder.advance_payment_method.toUpperCase()})` : 'Cash on Delivery (COD)'}</p>
                </div>
              </div>

              {/* Courier Fraud History (Hide during printing) */}
              {activeInvoiceOrder.buyer_success_rate !== null && (
                <div className="mb-8 bg-blue-50/70 p-5 rounded-xl border border-blue-200 print:hidden">
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Steadfast Courier Delivery History</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Delivery Success Rate</span>
                      <strong className="text-gray-800 text-sm font-black">{activeInvoiceOrder.buyer_success_rate}%</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Total Orders</span>
                      <strong className="text-gray-800 text-sm font-bold">{activeInvoiceOrder.buyer_total_orders}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Returned / Failed</span>
                      <strong className="text-red-650 text-sm font-bold">{activeInvoiceOrder.buyer_failed_orders}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Risk Evaluation</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black mt-1 ${
                        Number(activeInvoiceOrder.buyer_success_rate) >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
                      }`}>
                        {Number(activeInvoiceOrder.buyer_success_rate) >= 75 ? '🟢 Safe Buyer' : '🔴 High Risk Buyer'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Advance Payment Verification Box (Hide during printing) */}
              {activeInvoiceOrder.advance_transaction_id && (
                <div className="mb-8 bg-yellow-50/70 p-5 rounded-xl border border-yellow-200 print:hidden">
                  <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-3 font-black">COD Advance Payment Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Payment Method</span>
                      <strong className="text-gray-800 text-sm font-black uppercase">{activeInvoiceOrder.advance_payment_method}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Transaction ID (TrxID)</span>
                      <strong className="text-gray-800 text-sm font-mono font-bold select-all bg-white px-2 py-0.5 rounded border border-gray-200">{activeInvoiceOrder.advance_transaction_id}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Verification Status</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          activeInvoiceOrder.advance_payment_status === 'verified' ? 'bg-green-150 text-green-800' : 'bg-red-150 text-red-800'
                        }`}>
                          {activeInvoiceOrder.advance_payment_status === 'verified' ? '✓ Verified (পরিশোধিত)' : '⚡ Pending Verification'}
                        </span>
                        {activeInvoiceOrder.advance_payment_status !== 'verified' && (
                          <button 
                            onClick={async () => {
                              try {
                                await axios.put(`${API_URL}/api/admin/orders/${activeInvoiceOrder.id}/status`, {
                                  status: activeInvoiceOrder.status,
                                  payment_status: activeInvoiceOrder.payment_status,
                                  advance_payment_status: 'verified'
                                });
                                toast.success('Advance payment marked as verified!');
                                const res = await axios.get(`${API_URL}/api/admin/orders/${activeInvoiceOrder.id}`);
                                setActiveInvoiceOrder(res.data);
                                fetchOrders();
                              } catch(e) {
                                toast.error('Failed to verify payment');
                              }
                            }}
                            className="bg-[#2d4b3e] text-white px-2.5 py-1 rounded-md text-[10px] font-black hover:opacity-90 transition active:scale-[0.97]"
                          >
                            Mark Verified
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}</div>

              {/* Items Summary Table */}
              <table className="w-full text-left border-collapse mb-8 text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-400 uppercase text-xs tracking-wider">
                    <th className="pb-3 font-bold">Item Description</th>
                    <th className="pb-3 text-right font-bold w-20">Quantity</th>
                    <th className="pb-3 text-right font-bold w-24">Price</th>
                    <th className="pb-3 text-right font-bold w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeInvoiceOrder.items && activeInvoiceOrder.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="py-4">
                        <span className="font-bold text-gray-900">{item.product_name}</span>
                        {item.variant_name && (
                          <span className="ml-2 text-xs text-gray-500 font-bold">({item.variant_name})</span>
                        )}
                      </td>
                      <td className="py-4 text-right">{item.quantity}</td>
                      <td className="py-4 text-right">৳{item.price}</td>
                      <td className="py-4 text-right font-bold text-gray-900">৳{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end pt-4 border-t-2 border-gray-200">
                <div className="w-64 space-y-2.5 text-sm">
                  {(() => {
                    const subtotal = activeInvoiceOrder.items ? activeInvoiceOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) : 0;
                    const shippingFee = Math.max(0, activeInvoiceOrder.total_amount - subtotal);
                    return (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-semibold">৳{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping Fee</span>
                          <span className="font-semibold">৳{shippingFee}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-gray-900 font-bold text-lg">
                          <span>Grand Total</span>
                          <span className="text-[#2d4b3e]">৳{activeInvoiceOrder.total_amount}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Invoice Footer Branding */}
              <div className="mt-16 border-t pt-6 text-center text-xs text-gray-400 font-medium">
                <p>Thank you for choosing purity. For any assistance, please call 01872-345678.</p>
                <p className="mt-1 text-[10px] text-gray-300">Generated automatically via Ghani E-Commerce Engine</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
