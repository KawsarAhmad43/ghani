import React, { useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit, Check, Info } from 'lucide-react';
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

export default function HowToUseTab({ items, fetchData }) {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    id: null,
    title: '',
    short_details: '',
    icon: 'Flame',
    status: 1,
    sort_order: 0
  });

  const handleOpenAddModal = () => {
    setModalForm({
      id: null,
      title: '',
      short_details: '',
      icon: 'Flame',
      status: 1,
      sort_order: (items?.length || 0) + 1
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalForm({
      id: item.id,
      title: item.title || '',
      short_details: item.short_details || '',
      icon: item.icon || 'Flame',
      status: item.status !== undefined ? item.status : 1,
      sort_order: item.sort_order || 0
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalForm.id 
        ? `${API_URL}/api/admin/how-to-use/${modalForm.id}`
        : `${API_URL}/api/admin/how-to-use`;
      const method = modalForm.id ? 'put' : 'post';

      const res = await axios[method](url, modalForm, {
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
      await axios.delete(`${API_URL}/api/admin/how-to-use/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">How To Use (Product Page)</h2>
          <p className="text-xs text-gray-500">Manage the right-side "How to Use" section in Product Details.</p>
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
          <Plus size={16} /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className={`p-4 border rounded-xl flex items-start justify-between shadow-sm ${item.status ? 'bg-white' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex gap-4">
              <div className="text-2xl mt-1 text-[#2d4b3e]">{item.icon}</div>
              <div>
                <h4 className={`font-bold text-sm ${item.status ? 'text-gray-800' : 'text-gray-500 line-through'}`}>{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.short_details}</p>
                {!item.status && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-2 inline-block">Hidden</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 text-center py-6 text-xs text-gray-400">No items configured. Add one above.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-[#2d4b3e]">
                {editingItem ? 'Edit How To Use Item' : 'Add How To Use Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <Check size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4 overflow-y-auto flex-grow pr-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                  value={modalForm.title}
                  onChange={e => setModalForm({ ...modalForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Short Details</label>
                <textarea
                  rows="3"
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                  value={modalForm.short_details}
                  onChange={e => setModalForm({ ...modalForm, short_details: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Icon</label>
                <div className="grid grid-cols-6 gap-2 mb-2 max-h-36 overflow-y-auto p-1.5 border rounded-lg">
                  {PRESET_ICONS.map((preset) => {
                    const isSelected = modalForm.icon === preset.char;
                    return (
                      <button
                        key={preset.char}
                        type="button"
                        onClick={() => setModalForm({ ...modalForm, icon: preset.char })}
                        className={`text-2xl p-2 rounded-lg transition-all ${isSelected ? 'bg-[#2d4b3e] text-white scale-110 shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                        title={preset.label}
                      >
                        {preset.char}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">Selected Icon:</span>
                  <span className="text-lg bg-gray-100 px-2 rounded border">{modalForm.icon}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                    value={modalForm.sort_order}
                    onChange={e => setModalForm({ ...modalForm, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex-1 mt-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="statusCheck"
                    className="w-4 h-4 text-[#2d4b3e] rounded"
                    checked={modalForm.status === 1}
                    onChange={e => setModalForm({ ...modalForm, status: e.target.checked ? 1 : 0 })}
                  />
                  <label htmlFor="statusCheck" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Active (Show on site)
                  </label>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#2d4b3e] hover:opacity-90 rounded-lg shadow transition flex items-center gap-2">
                  <Save size={16} /> {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
