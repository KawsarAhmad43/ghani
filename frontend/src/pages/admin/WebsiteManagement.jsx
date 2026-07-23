import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit, HelpCircle, Image as ImageIcon, Check, Info, Globe, Sparkles, Heart, Flame, ShieldAlert, Award, Smile, Utensils } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

const PRESET_ICONS = [
  { char: '❤️', label: 'Heart (❤️)' },
  { char: '🧠', label: 'Brain (🧠)' },
  { char: '👶', label: 'Baby (👶)' },
  { char: '🥘', label: 'Cooking Pot (🥘)' },
  { char: '💧', label: 'Water Drop (💧)' },
  { char: '🏥', label: 'Clinic (🏥)' },
  { char: '☹️', label: 'Frowning (☹️)' },
  { char: 'Heart', label: 'Lucide Heart (Heart)' },
  { char: 'Smile', label: 'Lucide Smile (Smile)' },
  { char: 'Utensils', label: 'Lucide Utensils (Utensils)' },
  { char: 'Flame', label: 'Lucide Flame (Flame)' },
  { char: 'Sparkles', label: 'Lucide Sparkles (Sparkles)' }
];

export default function WebsiteManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);

  // Data State
  const [data, setData] = useState({
    about_main: { id: null, title: '', description: '', image: '' },
    about_feature: [],
    why_choose_reason: [],
    self_branding_point: [],
    our_process_step: [],
    product_advantage: [],
    usage_tip: []
  });

  // Modal / Form States
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // New Item State for the modal
  const [modalForm, setModalForm] = useState({
    id: null,
    type: '',
    title: '',
    description: '',
    icon: '❤️',
    image: '',
    sort_order: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/website-content`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching website content:', err);
      toast.error('Failed to load website content settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = (type) => {
    setModalForm({
      id: null,
      type,
      title: '',
      description: '',
      icon: type === 'product_advantage' ? 'Heart' : (type === 'usage_tip' ? 'Flame' : '❤️'),
      image: '',
      sort_order: (data[type]?.length || 0) + 1
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalForm({
      id: item.id,
      type: item.type,
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '❤️',
      image: item.image || '',
      sort_order: item.sort_order || 0
    });
    setEditingItem(item);
    setIsModalOpen(true);
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
      setModalForm(prev => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded and optimized to WebP successfully!');
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
      const res = await axios.post(`${API_URL}/api/admin/website-content`, modalForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success(res.data.message);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving content item:', err);
      toast.error('Failed to save website content item.');
    }
  };

  const handleAboutMainImageUpload = async (e) => {
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
      setData(prev => ({ 
        ...prev, 
        about_main: { ...prev.about_main, image: res.data.url } 
      }));
      toast.success('About Us image uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAboutMain = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API_URL}/api/admin/website-content`, {
        type: 'about_main',
        title: data.about_main.title,
        description: data.about_main.description,
        image: data.about_main.image
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('About Us main header text saved successfully!');
      fetchData();
    } catch (err) {
      console.error('Error saving main header:', err);
      toast.error('Failed to save header settings.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/api/admin/website-content/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item.');
    }
  };

  const tabs = [
    { id: 'about', label: 'আমাদের সম্পর্কে (About Us)', icon: Globe },
    { id: 'why_choose', label: 'কেন আমাদের তেল? (Why choose)', icon: Award },
    { id: 'self_branding', label: 'Self Branding (আসল তেল?)', icon: ShieldAlert },
    { id: 'our_process', label: 'Journey (আমাদের তেলের যাত্রা)', icon: Sparkles },
    { id: 'product_advantage', label: 'Advantage (স্বাস্থ্য উপকারিতা)', icon: Heart },
    { id: 'usage_tip', label: 'How to use (ব্যবহার নির্দেশিকা)', icon: Flame }
  ];

  if (loading && !data.about_main.title) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-[#2d4b3e] font-bold">
        Loading website configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Website Content Management</h1>
          <p className="text-sm text-gray-500">Manage dynamic homepage sections, user benefits, product advantages, and details.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full xl:w-72 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit flex-shrink-0">
          <nav className="flex flex-row xl:flex-col overflow-x-auto xl:overflow-x-visible">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 xl:border-b-0 xl:border-l-4 transition-colors whitespace-nowrap flex-grow xl:flex-grow-0 ${activeTab === tab.id
                  ? 'border-[#2d4b3e] bg-gray-50 text-[#2d4b3e]'
                  : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">

          {/* Tab 1: About Us */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-lg font-bold text-gray-800">সমাধান: আমাদের ঘানির খাঁটি সরিষার তেল</h2>
                <p className="text-xs text-gray-500">Manage the core header and features list in the About Us section.</p>
              </div>

              <div className="space-y-4 max-w-3xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">About Us Title</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                    value={data.about_main.title}
                    onChange={e => setData({ ...data, about_main: { ...data.about_main, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">বর্ণনা (About Us Description)</label>
                  <textarea
                    rows="4"
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                    value={data.about_main.description}
                    onChange={e => setData({ ...data, about_main: { ...data.about_main, description: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">About Us Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAboutMainImageUpload}
                    className="w-full text-sm mb-2"
                  />
                  <p className="text-xs text-gray-400 mb-2">Recommended ratio 1:1 or 4:3 (e.g. 600x600 px)</p>
                  {uploading && <span className="text-blue-500 text-xs font-bold">Uploading...</span>}
                  {data.about_main.image && (
                    <img src={data.about_main.image} alt="About Us" className="h-32 object-contain rounded border p-1" />
                  )}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveAboutMain} className="flex items-center gap-2 bg-[#2d4b3e] text-white px-5 py-2 rounded-lg font-bold hover:opacity-90 transition shadow-sm">
                    <Save size={16} /> Save Header Text
                  </button>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-800">Features List</h3>
                  <button onClick={() => handleOpenAddModal('about_feature')} className="flex items-center gap-1.5 bg-gray-100 text-[#2d4b3e] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition">
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.about_feature.map((feat) => (
                    <div key={feat.id} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[#2d4b3e]">
                          <Check size={14} />
                        </div>
                        <span className="font-semibold text-sm text-gray-700">{feat.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEditModal(feat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteItem(feat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {data.about_feature.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-xs text-gray-400">No features configured. Add one above.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Why Choose Us */}
          {activeTab === 'why_choose' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">এই তেল কেন খাবেন?</h2>
                  <p className="text-xs text-gray-500">Configure visual cards explaining product health benefits.</p>
                </div>
                <button onClick={() => handleOpenAddModal('why_choose_reason')} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
                  <Plus size={16} /> Add Reason Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.why_choose_reason.map((item) => (
                  <div key={item.id} className="border rounded-xl p-5 bg-yellow-50/50 border-yellow-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h4 className="font-bold text-base mb-1.5 text-gray-850">{item.title}</h4>
                      <p className="text-xs text-gray-550 leading-relaxed mb-4">{item.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                      <button onClick={() => handleOpenEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {data.why_choose_reason.length === 0 && (
                  <div className="col-span-4 text-center py-12 text-xs text-gray-400">No cards configured. Add one above.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Self Branding */}
          {activeTab === 'self_branding' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">আপনি কি নিশ্চিত আপনার তেলটা আসল?</h2>
                  <p className="text-xs text-gray-500">Add warning elements or checkpoints for customer trust.</p>
                </div>
                <button onClick={() => handleOpenAddModal('self_branding_point')} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
                  <Plus size={16} /> Add Trust Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.self_branding_point.map((item) => (
                  <div key={item.id} className="border rounded-xl p-6 bg-red-50/40 border-red-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="text-4xl mb-4">{item.icon}</div>
                      <h4 className="font-bold text-base mb-2 text-gray-800">{item.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                      <button onClick={() => handleOpenEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {data.self_branding_point.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-xs text-gray-400">No checkpoints configured. Add one above.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Our Process / Journey */}
          {activeTab === 'our_process' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">আমাদের তেলের যাত্রা (Our Journey Steps)</h2>
                  <p className="text-xs text-gray-500">Configure the timeline process describing seed cultivation to preparation.</p>
                </div>
                <button onClick={() => handleOpenAddModal('our_process_step')} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
                  <Plus size={16} /> Add Step Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {data.our_process_step.map((item, index) => (
                  <div key={item.id} className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="h-40 bg-gray-50 relative flex items-center justify-center overflow-hidden border-b">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-450 text-xs flex flex-col items-center"><ImageIcon size={28} /> No Image</div>
                        )}
                        <span className="absolute top-2 left-2 bg-[#2d4b3e] text-white text-xs font-bold px-2 py-0.5 rounded shadow">Step {index + 1}</span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-800">{item.title}</h4>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 border-t flex justify-end gap-2">
                      <button onClick={() => handleOpenEditModal(item)} className="p-1 text-blue-600 hover:bg-white rounded border border-transparent hover:border-blue-200 transition" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:bg-white rounded border border-transparent hover:border-red-200 transition" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {data.our_process_step.length === 0 && (
                  <div className="col-span-4 text-center py-12 text-xs text-gray-400">No process steps configured. Add one above.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Product Advantage */}
          {activeTab === 'product_advantage' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">স্বাস্থ্য উপকারitas (Product Details Page Advantages)</h2>
                  <p className="text-xs text-gray-500">Configure health advantage items with presets shown in product details pages.</p>
                </div>
                <button onClick={() => handleOpenAddModal('product_advantage')} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
                  <Plus size={16} /> Add Advantage
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.product_advantage.map((item) => (
                  <div key={item.id} className="border rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#2d4b3e] mb-4 border border-green-100 font-bold">
                        {item.icon === 'Heart' && <Heart size={20} />}
                        {item.icon === 'Smile' && <Smile size={20} />}
                        {item.icon === 'Utensils' && <Utensils size={20} />}
                        {!['Heart', 'Smile', 'Utensils'].includes(item.icon) && <span>{item.icon}</span>}
                      </div>
                      <h4 className="font-bold text-base mb-1 text-gray-800">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-3">
                      <button onClick={() => handleOpenEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {data.product_advantage.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-xs text-gray-400">No advantages configured. Add one above.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: How to Use */}
          {activeTab === 'usage_tip' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">ব্যবহার নির্দেশিকা (How to Use Guides)</h2>
                  <p className="text-xs text-gray-500">Configure cooking, skin, or hair usage tips shown in product details pages.</p>
                </div>
                <button onClick={() => handleOpenAddModal('usage_tip')} className="flex items-center gap-1.5 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm">
                  <Plus size={16} /> Add Usage Guide
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.usage_tip.map((item) => (
                  <div key={item.id} className="border rounded-xl p-6 bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#2d4b3e] flex-shrink-0 border font-bold">
                      {item.icon === 'Flame' && <Flame size={24} />}
                      {item.icon === 'Sparkles' && <Sparkles size={24} />}
                      {!['Flame', 'Sparkles'].includes(item.icon) && <span className="text-xl">{item.icon}</span>}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base text-gray-800 mb-1">{item.title}</h4>
                        <div className="flex gap-1">
                          <button onClick={() => handleOpenEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
                {data.usage_tip.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-xs text-gray-400">No usage guides configured. Add one above.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Dynamic Item Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-[#2d4b3e]">
                {editingItem ? 'Edit Content Item' : `Add New Content (${modalForm.type})`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <Check size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 overflow-y-auto flex-grow pr-1">

              {/* Type helper indicator */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg flex items-start gap-2.5 mb-2 text-xs text-blue-900 font-medium">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  Managing component content target: <strong>{tabs.find(t => t.id === modalForm.type)?.label || modalForm.type}</strong>.
                </div>
              </div>

              {/* Title input (used by all types except main which uses dedicated save) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {modalForm.type === 'our_process_step' ? 'ধাপের নাম / শিরোনাম (Step Name)' : 'শিরোনাম / বৈশিষ্ট্য (Title)'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                  value={modalForm.title}
                  onChange={e => setModalForm({ ...modalForm, title: e.target.value })}
                />
              </div>

              {/* Description (used by everything except feature steps) */}
              {!['about_feature', 'our_process_step'].includes(modalForm.type) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                  <textarea
                    rows="3"
                    required={modalForm.type !== 'usage_tip'}
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                    value={modalForm.description}
                    onChange={e => setModalForm({ ...modalForm, description: e.target.value })}
                  />
                </div>
              )}

              {/* Image Upload (Our Process Step only) */}
              {modalForm.type === 'our_process_step' && (
                <div className="border rounded-xl p-4 bg-gray-50 flex items-center gap-4">
                  {modalForm.image ? (
                    <img src={modalForm.image} alt="Preview" className="w-20 h-20 object-cover rounded shadow border" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex flex-col items-center justify-center text-gray-400 border border-dashed"><ImageIcon size={20} /> <span className="text-[10px]">No Image</span></div>
                  )}
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Upload Process Image (optimized to WebP)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#2d4b3e] file:text-white hover:file:opacity-90 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    {uploading && <p className="text-[10px] text-blue-600 mt-1.5 animate-pulse font-bold">Uploading and converting image...</p>}
                  </div>
                </div>
              )}

              {/* Icon selector (reasons, keypoints, advantages, tips) */}
              {!['about_feature', 'our_process_step'].includes(modalForm.type) && (
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
                          className={`p-2 rounded-lg border text-sm flex items-center justify-center transition ${isSelected ? 'bg-green-50 border-[#2d4b3e] text-[#2d4b3e] font-extrabold shadow-sm' : 'bg-white hover:bg-gray-50'
                            }`}
                          title={preset.label}
                        >
                          {preset.char}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Or enter custom char/label:</span>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-xs w-24 outline-none focus:border-[#2d4b3e]"
                      value={modalForm.icon}
                      onChange={e => setModalForm({ ...modalForm, icon: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ক্রম নির্ধারণ (Sort Order)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#2d4b3e]"
                  value={modalForm.sort_order}
                  onChange={e => setModalForm({ ...modalForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Save CTAs */}
              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition font-semibold text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-6 py-2 bg-[#2d4b3e] text-white rounded-lg font-bold hover:opacity-90 transition shadow disabled:opacity-50 text-sm">
                  {editingItem ? 'Update Content' : 'Save Content'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
