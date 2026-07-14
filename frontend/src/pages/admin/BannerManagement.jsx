import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, Save, X } from 'lucide-react';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function BannerManagement() {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [heroMode, setHeroMode] = useState('slider'); // 'slider' or 'single'
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '', subtitle: '', description: '', button_text: '', button_link: '', image: '', sort_order: 0, status: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bannerRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/banners`),
        axios.get(`${API_URL}/api/admin/settings`)
      ]);
      setBanners(bannerRes.data);
      if (settingsRes.data.hero_mode) {
        setHeroMode(settingsRes.data.hero_mode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveHeroMode = async (mode) => {
    setHeroMode(mode);
    await axios.post(`${API_URL}/api/admin/settings`, { hero_mode: mode });
  };

  const handleFileUpload = async (file, isEdit = false) => {
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      if (isEdit) {
        setEditingBanner(prev => ({ ...prev, image: res.data.url }));
      } else {
        setNewBanner(prev => ({ ...prev, image: res.data.url }));
      }
      return res.data.url;
    } catch (err) {
      toast.error('Image upload failed');
      setUploading(false);
      return null;
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.image) {
      toast.warning("Image is required");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/banners`, newBanner);
      setIsAdding(false);
      setNewBanner({ title: '', subtitle: '', description: '', button_text: '', button_link: '', image: '', sort_order: 0, status: 1 });
      fetchData();
    } catch (err) {
      toast.error("Failed to add banner");
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner.image) {
      toast.warning("Image is required");
      return;
    }
    try {
      await axios.put(`${API_URL}/api/admin/banners/${editingBanner.id}`, editingBanner);
      setEditingBanner(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update banner");
    }
  };

  const deleteBanner = async (id) => {
    if(window.confirm('Delete this banner?')) {
      await axios.delete(`${API_URL}/api/admin/banners/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Banner & Slider Management</h1>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingBanner(null);
          }} 
          className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold"
        >
          <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold">Homepage Hero Configuration</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Hero Mode:</span>
            <select className="border rounded p-2 text-sm bg-gray-50 font-semibold" value={heroMode} onChange={(e) => saveHeroMode(e.target.value)}>
              <option value="slider">Image Slider (Carousel)</option>
              <option value="single">Single Static Image</option>
            </select>
          </div>
        </div>

        {/* Add Banner Form */}
        {isAdding && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="font-bold mb-4 text-sm text-brand-green">Add New Banner Image</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Banner Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if(e.target.files[0]) {
                    await handleFileUpload(e.target.files[0], false);
                  }
                }} className="text-sm"/>
                {uploading && <span className="text-xs text-blue-500 font-bold ml-2">Uploading...</span>}
                {newBanner.image && <img src={newBanner.image} alt="preview" className="mt-2 h-20 rounded border object-contain bg-white p-1" />}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Title</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={newBanner.title} onChange={e=>setNewBanner({...newBanner, title: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Subtitle</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={newBanner.subtitle} onChange={e=>setNewBanner({...newBanner, subtitle: e.target.value})}/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Description</label>
                <textarea className="w-full border rounded p-2 text-sm" rows="2" value={newBanner.description} onChange={e=>setNewBanner({...newBanner, description: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Button Text</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={newBanner.button_text} onChange={e=>setNewBanner({...newBanner, button_text: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Button Link</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={newBanner.button_link} onChange={e=>setNewBanner({...newBanner, button_link: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Sort Order</label>
                <input type="number" className="w-full border rounded p-2 text-sm" value={newBanner.sort_order} onChange={e=>setNewBanner({...newBanner, sort_order: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Status</label>
                <select className="w-full border rounded p-2 text-sm bg-white" value={newBanner.status} onChange={e=>setNewBanner({...newBanner, status: Number(e.target.value)})}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddBanner} className="mt-4 bg-[#2d4b3e] text-white px-4 py-2 text-sm rounded font-bold hover:bg-opacity-90">Save Banner</button>
          </div>
        )}

        {/* Edit Banner Form */}
        {editingBanner && (
          <div className="bg-yellow-50/50 p-4 rounded-lg mb-6 border border-yellow-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-yellow-800">Edit Banner Image</h3>
              <button onClick={() => setEditingBanner(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Banner Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if(e.target.files[0]) {
                    await handleFileUpload(e.target.files[0], true);
                  }
                }} className="text-sm"/>
                {uploading && <span className="text-xs text-blue-500 font-bold ml-2">Uploading...</span>}
                {editingBanner.image && <img src={editingBanner.image} alt="preview" className="mt-2 h-20 rounded border object-contain bg-white p-1" />}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Title</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={editingBanner.title} onChange={e=>setEditingBanner({...editingBanner, title: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Subtitle</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={editingBanner.subtitle || ''} onChange={e=>setEditingBanner({...editingBanner, subtitle: e.target.value})}/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Description</label>
                <textarea className="w-full border rounded p-2 text-sm" rows="2" value={editingBanner.description} onChange={e=>setEditingBanner({...editingBanner, description: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Button Text</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={editingBanner.button_text} onChange={e=>setEditingBanner({...editingBanner, button_text: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Button Link</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={editingBanner.button_link} onChange={e=>setEditingBanner({...editingBanner, button_link: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Sort Order</label>
                <input type="number" className="w-full border rounded p-2 text-sm" value={editingBanner.sort_order} onChange={e=>setEditingBanner({...editingBanner, sort_order: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Status</label>
                <select className="w-full border rounded p-2 text-sm bg-white" value={editingBanner.status} onChange={e=>setEditingBanner({...editingBanner, status: Number(e.target.value)})}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <button onClick={handleUpdateBanner} className="mt-4 bg-[#2d4b3e] text-white px-4 py-2 text-sm rounded font-bold hover:bg-opacity-90">Update Banner</button>
          </div>
        )}

        <div className="space-y-3">
          {banners.map(banner => (
            <div key={banner.id} className="flex items-center gap-4 border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
              <button className="text-gray-400 hover:text-gray-600 cursor-grab"><GripVertical size={20}/></button>
              
              <div className="w-24 h-12 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400"/>}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{banner.title || 'Untitled Banner'}</h3>
                {banner.subtitle && <p className="text-xs text-brand-green font-medium">{banner.subtitle}</p>}
                <p className="text-xs text-gray-500">Order: {banner.sort_order}</p>
              </div>
              
              <div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${banner.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {banner.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded" 
                  onClick={() => {
                    setEditingBanner(banner);
                    setIsAdding(false);
                  }}
                >
                  <Edit size={16}/>
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded" onClick={() => deleteBanner(banner.id)}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No banners added yet. Upload one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
