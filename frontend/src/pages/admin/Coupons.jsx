import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';
import API_URL from '../../utils/api';

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '',
        valid_for_all: true,
        eligible_products: [],
        is_active: true,
        expiry_date: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupons();
        fetchProducts();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get(`${API_URL}/api/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data);
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
                return;
            }
            setError('Failed to fetch coupons.');
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/products`);
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch products for coupons');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            
            // Format data
            const dataToSave = {
                ...formData,
                eligible_products: formData.valid_for_all ? [] : formData.eligible_products
            };

            if (editingId) {
                await axios.put(`${API_URL}/api/admin/coupons/${editingId}`, dataToSave, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/admin/coupons`, dataToSave, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ code: '', discount_percent: '', valid_for_all: true, eligible_products: [], is_active: true, expiry_date: '' });
            fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save coupon.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${API_URL}/api/admin/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCoupons();
        } catch (err) {
            setError('Failed to delete coupon.');
        }
    };

    const toggleProduct = (productId) => {
        setFormData(prev => {
            const current = Array.isArray(prev.eligible_products) ? prev.eligible_products : [];
            if (current.includes(productId)) {
                return { ...prev, eligible_products: current.filter(id => id !== productId) };
            } else {
                return { ...prev, eligible_products: [...current, productId] };
            }
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Coupon Management</h2>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ code: '', discount_percent: '', valid_for_all: true, eligible_products: [], is_active: true, expiry_date: '' }); }}
                    className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 font-semibold"
                >
                    <Plus size={20} /> Add Coupon
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {showForm && (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Coupon Code</label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full border rounded p-2"
                                placeholder="e.g. EID2026"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Percent (%)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                value={formData.discount_percent}
                                onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                className="w-full border rounded p-2"
                                placeholder="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-2 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                Is Active
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={formData.valid_for_all}
                                    onChange={(e) => setFormData({ ...formData, valid_for_all: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                Valid For All Products
                            </label>
                        </div>
                        
                        {!formData.valid_for_all && (
                            <div className="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                                <label className="block text-sm font-bold mb-2">Select Eligible Products</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border bg-white rounded">
                                    {products.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm p-1 hover:bg-gray-50">
                                            <input 
                                                type="checkbox" 
                                                checked={Array.isArray(formData.eligible_products) && formData.eligible_products.includes(p.id)}
                                                onChange={() => toggleProduct(p.id)}
                                            />
                                            {p.name}
                                        </label>
                                    ))}
                                    {products.length === 0 && <span className="text-gray-500 text-sm">No products available.</span>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded font-medium hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#2d4b3e] text-white font-medium rounded hover:bg-opacity-90">Save Coupon</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-medium text-gray-500">Code</th>
                            <th className="p-4 text-left font-medium text-gray-500">Discount</th>
                            <th className="p-4 text-left font-medium text-gray-500">Applies To</th>
                            <th className="p-4 text-left font-medium text-gray-500">Status</th>
                            <th className="p-4 text-left font-medium text-gray-500">Expiry</th>
                            <th className="p-4 text-center font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold">{coupon.code}</td>
                                <td className="p-4">{coupon.discount_percent}%</td>
                                <td className="p-4 text-sm text-gray-600">
                                    {coupon.valid_for_all ? 'All Products' : 'Selected Products'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleString() : 'Never'}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => { 
                                            // Handle parsing of eligible_products gracefully
                                            let parsedEligible = [];
                                            try {
                                                if (typeof coupon.eligible_products === 'string') {
                                                    parsedEligible = JSON.parse(coupon.eligible_products);
                                                } else if (Array.isArray(coupon.eligible_products)) {
                                                    parsedEligible = coupon.eligible_products;
                                                }
                                            } catch(e) {}
                                            setFormData({...coupon, eligible_products: parsedEligible, expiry_date: coupon.expiry_date ? coupon.expiry_date.substring(0, 16) : ''}); 
                                            setEditingId(coupon.id); 
                                            setShowForm(true); 
                                        }} 
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && <div className="p-8 text-center text-gray-500">No coupons found. Click "Add Coupon" to create one.</div>}
            </div>
        </div>
    );
}
