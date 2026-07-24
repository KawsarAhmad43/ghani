import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function QuicklinksManagement() {
    const toast = useToast();
    const [quicklinks, setQuicklinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        is_pdf: false,
        status: 1,
        sort_order: 0
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchQuicklinks();
    }, []);

    const fetchQuicklinks = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get(`${API_URL}/api/admin/quicklinks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuicklinks(res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch quicklinks.');
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const data = new FormData();
        data.append('file', file);
        setUploading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.post(`${API_URL}/api/admin/upload-file`, data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setFormData({ ...formData, url: res.data.url, is_pdf: true });
            toast.success('File uploaded successfully');
        } catch (err) {
            toast.error('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editingId) {
                await axios.put(`${API_URL}/api/admin/quicklinks/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Quicklink updated successfully');
            } else {
                await axios.post(`${API_URL}/api/admin/quicklinks`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Quicklink added successfully');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ title: '', url: '', is_pdf: false, status: 1, sort_order: 0 });
            fetchQuicklinks();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save quicklink.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quicklink?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${API_URL}/api/admin/quicklinks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Quicklink deleted');
            fetchQuicklinks();
        } catch (err) {
            toast.error('Failed to delete quicklink.');
        }
    };

    if (loading) return <div>Loading quicklinks...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Quicklinks Management</h2>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', url: '', is_pdf: false, status: 1, sort_order: 0 });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors"
                >
                    <Plus size={16} /> Add Quicklink
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
                                className="w-full p-2 border rounded bg-white"
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Link URL (or upload PDF)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value, is_pdf: false})}
                                    placeholder="https://example.com or /page"
                                    className="flex-1 p-2 border rounded"
                                />
                                <div className="relative overflow-hidden inline-block">
                                    <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                                        {uploading ? 'Uploading...' : 'Upload PDF'}
                                    </button>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sort Order</label>
                            <input 
                                type="number" 
                                value={formData.sort_order}
                                onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="bg-[#2d4b3e] text-white px-4 py-2 rounded">
                            {editingId ? 'Update' : 'Save'} Quicklink
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 px-4 py-2 rounded">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-3 text-sm font-medium text-gray-600">Title</th>
                            <th className="p-3 text-sm font-medium text-gray-600">Type</th>
                            <th className="p-3 text-sm font-medium text-gray-600">URL</th>
                            <th className="p-3 text-sm font-medium text-gray-600">Status</th>
                            <th className="p-3 text-sm font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quicklinks.map(link => (
                            <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 text-sm">{link.title}</td>
                                <td className="p-3 text-sm">
                                    {link.is_pdf ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">PDF</span> : <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Link</span>}
                                </td>
                                <td className="p-3 text-sm truncate max-w-[200px]">{link.url}</td>
                                <td className="p-3 text-sm">
                                    {link.status === 1 ? 'Active' : 'Inactive'}
                                </td>
                                <td className="p-3 text-sm text-right">
                                    <button 
                                        onClick={() => {
                                            setFormData({ title: link.title, url: link.url, is_pdf: link.is_pdf, status: link.status, sort_order: link.sort_order });
                                            setEditingId(link.id);
                                            setShowForm(true);
                                        }}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-2"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(link.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {quicklinks.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">No quicklinks found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
