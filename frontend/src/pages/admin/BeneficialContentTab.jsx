import React, { useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit, Check, X, Image as ImageIcon } from 'lucide-react';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const PRESET_ICONS = [
  { char: '❤️', label: 'Heart' },
  { char: '🧠', label: 'Brain' },
  { char: '👶', label: 'Baby' },
  { char: '🥘', label: 'Cooking Pot' },
  { char: '💧', label: 'Water Drop' },
  { char: '🏥', label: 'Clinic' },
  { char: '☹️', label: 'Frowning' },
  { char: 'Heart', label: 'Lucide Heart' },
  { char: 'Smile', label: 'Lucide Smile' },
  { char: 'Utensils', label: 'Lucide Utensils' },
  { char: 'Flame', label: 'Lucide Flame' },
  { char: 'Sparkles', label: 'Lucide Sparkles' }
];

export default function BeneficialContentTab({ items, fetchData }) {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalForm, setModalForm] = useState({
    id: null,
    title: '',
    short_description: '',
    icon: 'Heart',
    detailed_title: '',
    detailed_short_description: '',
    detailed_image: '',
    detailed_content: '',
    key_points: [],
    benefits_points: [],
    status: 1,
    sort_order: 0
  });

  // Array Field States
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newBenefitPoint, setNewBenefitPoint] = useState('');

  const handleOpenAddModal = () => {
    setModalForm({
      id: null,
      title: '',
      short_description: '',
      icon: 'Heart',
      detailed_title: '',
      detailed_short_description: '',
      detailed_image: '',
      detailed_content: '',
      key_points: [],
      benefits_points: [],
      status: 1,
      sort_order: (items?.length || 0) + 1
    });
    setEditingItem(null);
    setIsModalOpen(true);
    setNewKeyPoint('');
    setNewBenefitPoint('');
  };

  const handleOpenEditModal = (item) => {
    let parsedKeyPoints = [];
    let parsedBenefitsPoints = [];
    try {
      parsedKeyPoints = typeof item.key_points === 'string' ? JSON.parse(item.key_points) : (item.key_points || []);
      parsedBenefitsPoints = typeof item.benefits_points === 'string' ? JSON.parse(item.benefits_points) : (item.benefits_points || []);
    } catch (e) {
      console.error('Error parsing JSON fields', e);
    }

    setModalForm({
      id: item.id,
      title: item.title || '',
      short_description: item.short_description || '',
      icon: item.icon || 'Heart',
      detailed_title: item.detailed_title || '',
      detailed_short_description: item.detailed_short_description || '',
      detailed_image: item.detailed_image || '',
      detailed_content: item.detailed_content || '',
      key_points: parsedKeyPoints,
      benefits_points: parsedBenefitsPoints,
      status: item.status !== undefined ? item.status : 1,
      sort_order: item.sort_order || 0
    });
    setEditingItem(item);
    setIsModalOpen(true);
    setNewKeyPoint('');
    setNewBenefitPoint('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API_URL}/api/admin/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setModalForm(prev => ({ ...prev, detailed_image: res.data.url }));
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalForm.id 
        ? `${API_URL}/api/admin/beneficial-contents/${modalForm.id}`
        : `${API_URL}/api/admin/beneficial-contents`;
      const method = modalForm.id ? 'put' : 'post';

      const payload = {
        ...modalForm,
        key_points: modalForm.key_points,
        benefits_points: modalForm.benefits_points
      };

      const res = await axios[method](url, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error('Failed to save item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/api/admin/beneficial-contents/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item.');
    }
  };

  const addArrayItem = (field, value, setInput) => {
    if (!value.trim()) return;
    setModalForm(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setInput('');
  };

  const removeArrayItem = (field, index) => {
    setModalForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Beneficial Contents (Right Side)</h2>
          <p className="text-xs text-gray-500">Manage the right-side product benefits and their detailed pages.</p>
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
          <Plus size={16} /> Add Benefit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition ${item.status ? 'bg-white' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="text-4xl text-[#2d4b3e]">{item.icon}</div>
                {!item.status && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Hidden</span>}
              </div>
              <h4 className="font-bold text-base mb-1.5 text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.short_description}</p>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-3 text-center py-12 text-xs text-gray-400">No benefits configured. Add one above.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-100 text-gray-800">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold text-[#2d4b3e]">
                {editingItem ? 'Edit Beneficial Content' : 'Add Beneficial Content'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <Check size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* --- Section 1: Card Content --- */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#2d4b3e] border-b pb-2">1. Card Info (Shown on Product Page)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                      <input
                        type="text" required
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                        value={modalForm.title} onChange={e => setModalForm({ ...modalForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
                      <input
                        type="text" required
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                        value={modalForm.short_description} onChange={e => setModalForm({ ...modalForm, short_description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select Icon</label>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-2 p-2 border rounded-lg bg-gray-50">
                      {PRESET_ICONS.map((preset) => {
                        const isSelected = modalForm.icon === preset.char;
                        return (
                          <button
                            key={preset.char} type="button"
                            onClick={() => setModalForm({ ...modalForm, icon: preset.char })}
                            className={`text-xl p-2 rounded-lg transition-all flex items-center justify-center ${isSelected ? 'bg-[#2d4b3e] text-white scale-110 shadow-md' : 'hover:bg-gray-200 text-gray-600'}`}
                            title={preset.label}
                          >
                            {preset.char}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* --- Section 2: Detailed Content --- */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#2d4b3e] border-b pb-2">2. Detailed Page Content (Shown when clicked)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Title</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                        value={modalForm.detailed_title} onChange={e => setModalForm({ ...modalForm, detailed_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Short Description</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                        value={modalForm.detailed_short_description} onChange={e => setModalForm({ ...modalForm, detailed_short_description: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Content (HTML/Text)</label>
                    <textarea
                      rows="4"
                      className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e] font-mono text-sm"
                      value={modalForm.detailed_content} onChange={e => setModalForm({ ...modalForm, detailed_content: e.target.value })}
                      placeholder="<p>Enter details here...</p>"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Image (Optional)</label>
                    <div className="flex items-center gap-4">
                      {modalForm.detailed_image && (
                        <img src={modalForm.detailed_image} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                      )}
                      <div className="flex-1">
                        <input
                          type="file" accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full text-xs"
                        />
                        {uploading && <span className="text-blue-500 text-xs mt-1 block">Uploading...</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Section 3: Lists --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Points */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Key Points</label>
                    <ul className="space-y-2 mb-3">
                      {modalForm.key_points.map((pt, i) => (
                        <li key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                          <span>{pt}</span>
                          <button type="button" onClick={() => removeArrayItem('key_points', i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text" className="flex-1 border rounded p-1.5 text-sm" placeholder="Add point..."
                        value={newKeyPoint} onChange={e => setNewKeyPoint(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('key_points', newKeyPoint, setNewKeyPoint))}
                      />
                      <button type="button" onClick={() => addArrayItem('key_points', newKeyPoint, setNewKeyPoint)} className="bg-gray-200 px-3 rounded hover:bg-gray-300 text-sm font-bold"><Plus size={16} /></button>
                    </div>
                  </div>

                  {/* Benefits Points */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Benefits Points</label>
                    <ul className="space-y-2 mb-3">
                      {modalForm.benefits_points.map((pt, i) => (
                        <li key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                          <span>{pt}</span>
                          <button type="button" onClick={() => removeArrayItem('benefits_points', i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text" className="flex-1 border rounded p-1.5 text-sm" placeholder="Add benefit..."
                        value={newBenefitPoint} onChange={e => setNewBenefitPoint(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('benefits_points', newBenefitPoint, setNewBenefitPoint))}
                      />
                      <button type="button" onClick={() => addArrayItem('benefits_points', newBenefitPoint, setNewBenefitPoint)} className="bg-gray-200 px-3 rounded hover:bg-gray-300 text-sm font-bold"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
                
                {/* --- Section 4: Config --- */}
                <div className="flex items-center gap-6 border-t pt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e] max-w-xs"
                      value={modalForm.sort_order}
                      onChange={e => setModalForm({ ...modalForm, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 mt-4">
                    <input
                      type="checkbox" id="statusCheck" className="w-4 h-4 text-[#2d4b3e] rounded"
                      checked={modalForm.status === 1}
                      onChange={e => setModalForm({ ...modalForm, status: e.target.checked ? 1 : 0 })}
                    />
                    <label htmlFor="statusCheck" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Active (Show on site)
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#2d4b3e] hover:bg-[#233b31] rounded-lg shadow transition flex items-center gap-2">
                  <Save size={16} /> {editingItem ? 'Update Content' : 'Add Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
