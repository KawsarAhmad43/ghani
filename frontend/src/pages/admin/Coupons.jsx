import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';
import API_URL from '../../utils/api';

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '',
        valid_for_all: true,
        is_active: true,
        expiry_date: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get(`${API_URL}/api/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch coupons.');
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editingId) {
                await axios.put(`${API_URL}/api/coupons/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/coupons`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ code: '', discount_percent: '', valid_for_all: true, is_active: true, expiry_date: '' });
            fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save coupon.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${API_URL}/api/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCoupons();
        } catch (err) {
            setError('Failed to delete coupon.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Coupon Management</h2>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); }}
                    className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                >
                    <Plus size={20} /> Add Coupon
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {showForm && (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md mb-8">
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <input
                                type="datetime-local"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                Is Active
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-opacity-90">Save Coupon</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-medium text-gray-500">Code</th>
                            <th className="p-4 text-left font-medium text-gray-500">Discount</th>
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
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleString() : 'Never'}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => { setFormData(coupon); setEditingId(coupon.id); setShowForm(true); }} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && <div className="p-8 text-center text-gray-500">No coupons found.</div>}
            </div>
        </div>
    );
}
