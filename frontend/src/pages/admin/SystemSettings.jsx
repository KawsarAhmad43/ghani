import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings, Share2, Truck, Bell, Trash2, Gift, Link } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';
import QuicklinksManagement from './QuicklinksManagement';

export default function SystemSettings() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    site_title: 'Ghani Mustard Oil',
    contact_email: 'support@ghani.com',
    contact_phone: '+8801711223344',
    store_mode: 'Single Product',
    default_language: 'Bangla',
    site_logo: '',
    store_description: 'আমরা সরাসরি গ্রাম থেকে বীজ সংগ্রহ করে ঘানিতে ভাঙানো বিশুদ্ধ সরিষার তেল সরবরাহ করি। আমাদের লক্ষ্য সুস্থ ও নিরাপদ খাদ্য নিশ্চিত করা।',
    store_address: 'ঢাকা, বাংলাদেশ',
    social_links_json: '',
    theme_primary_color: '#2d4b3e',
    theme_accent_color: '#f7b700',
    theme_gradient: '#fefce8',
    
    delivery_inside_dhaka: '60',
    delivery_outside_dhaka: '120',
    free_delivery_threshold: '2000',
    
    social_facebook: 'https://facebook.com/',
    social_instagram: 'https://instagram.com/',
    whatsapp_number: '+8801711223344',
    whatsapp_message: 'Hello, I want to order.',
    
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_user: 'admin@ghani.com',
    smtp_pass: '',
    smtp_encryption: 'SSL'
  });

  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/settings`).then(res => {
      if(Object.keys(res.data).length > 0) {
        setSettings(prev => ({...prev, ...res.data}));
        let loadedLinks = [];
        if (res.data.social_links_json) {
          try {
            loadedLinks = JSON.parse(res.data.social_links_json);
          } catch (e) {
            console.error('Failed to parse social_links_json:', e);
          }
        }
        if (!loadedLinks || loadedLinks.length === 0) {
          loadedLinks = [
            { name: 'Facebook', url: 'https://facebook.com/ghanibd', status: 'Show' },
            { name: 'Instagram', url: 'https://instagram.com/ghanibd', status: 'Show' }
          ];
          setSettings(prev => ({ ...prev, social_links_json: JSON.stringify(loadedLinks) }));
        }
        setSocialLinks(loadedLinks);
      }
    });
  }, []);

  const updateSocialLinks = (newLinks) => {
    setSocialLinks(newLinks);
    setSettings(prev => ({ ...prev, social_links_json: JSON.stringify(newLinks) }));
  };

  const addSocialLink = () => {
    const newLink = { name: '', url: '', status: 'Show' };
    updateSocialLinks([...socialLinks, newLink]);
  };

  const removeSocialLink = (index) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    updateSocialLinks(updated);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    updateSocialLinks(updated);
  };

  const saveSettings = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/settings`, settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings({...settings, site_logo: res.data.url});
    } catch (err) {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUploadPdf = async (e, field) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/upload-file`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings({...settings, [field]: res.data.url});
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings({...settings, favicon: res.data.url});
    } catch (err) {
      toast.error('Favicon upload failed');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'delivery', label: 'Delivery & Advance Pay', icon: Truck },
    { id: 'social', label: 'Social & WhatsApp', icon: Share2 },
    { id: 'smtp', label: 'SMTP Server', icon: Bell },
    { id: 'loyalty', label: 'Loyalty Points', icon: Gift },
    { id: 'quicklinks', label: 'Quicklinks', icon: Link }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <button onClick={saveSettings} className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
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
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'loyalty' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-bold border-b pb-2">Loyalty Points Configuration</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Rate (Amount for 1 point)</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={settings.loyalty_conversion_rate || ''} onChange={e=>setSettings({...settings, loyalty_conversion_rate: e.target.value})} placeholder="e.g. 100" />
                  <p className="text-xs text-gray-500 mt-1">If 100, a 500 Taka purchase gives 5 points.</p>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase Amount</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={settings.loyalty_min_purchase || ''} onChange={e=>setSettings({...settings, loyalty_min_purchase: e.target.value})} placeholder="e.g. 500" />
                  <p className="text-xs text-gray-500 mt-1">Order must be at least this amount to earn points.</p>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Points Usable Per Order</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={settings.loyalty_max_points_per_order || ''} onChange={e=>setSettings({...settings, loyalty_max_points_per_order: e.target.value})} placeholder="e.g. 50" />
                  <p className="text-xs text-gray-500 mt-1">Maximum points a customer can use in a single order.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-bold border-b pb-2">General Settings</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo <span className="text-xs text-gray-500 font-normal">(Recommended Size: 250x60)</span></label>
                  <div className="flex items-center gap-4">
                    {settings.site_logo && <img src={settings.site_logo} alt="Logo" className="h-12 rounded border p-1 bg-gray-50" />}
                    <div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm border p-1 rounded" />
                      {uploading && <span className="text-xs text-blue-500 ml-2">Uploading...</span>}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Favicon <span className="text-xs text-gray-500 font-normal">(Recommended Size: 32x32 or 64x64)</span></label>
                  <div className="flex items-center gap-4">
                    {settings.favicon && <img src={settings.favicon} alt="Favicon" className="h-8 rounded border p-1 bg-gray-50" />}
                    <div>
                      <input type="file" accept="image/*" onChange={handleFaviconUpload} className="text-sm border p-1 rounded" />
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.site_title} onChange={e=>setSettings({...settings, site_title: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Slogan (স্লোগান)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.store_slogan || ''} onChange={e=>setSettings({...settings, store_slogan: e.target.value})} placeholder="ঘানি সরিষার তেল" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Description (ফুটার বিবরণ)</label>
                  <textarea rows="3" className="w-full border rounded-lg p-2" value={settings.store_description || ''} onChange={e=>setSettings({...settings, store_description: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Address (দোকানের ঠিকানা)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.store_address || ''} onChange={e=>setSettings({...settings, store_address: e.target.value})} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade License Number (ট্রেড লাইসেন্স)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.trade_license || ''} onChange={e=>setSettings({...settings, trade_license: e.target.value})} placeholder="e.g. TRAD/DNCC/000000/2026" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input type="email" className="w-full border rounded-lg p-2" value={settings.contact_email} onChange={e=>setSettings({...settings, contact_email: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.contact_phone} onChange={e=>setSettings({...settings, contact_phone: e.target.value})} />
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Theme Style Customization (থিম কালার কাস্টমাইজেশন)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Theme Color (মূল থিম কালার)</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" className="w-10 h-10 border rounded cursor-pointer p-0.5" value={settings.theme_primary_color || '#2d4b3e'} onChange={e=>setSettings({...settings, theme_primary_color: e.target.value})} />
                        <input type="text" className="flex-grow border rounded-lg p-2 text-sm" value={settings.theme_primary_color || ''} onChange={e=>setSettings({...settings, theme_primary_color: e.target.value})} placeholder="#2d4b3e" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Accent Theme Color (অ্যাকসেন্ট কালার)</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" className="w-10 h-10 border rounded cursor-pointer p-0.5" value={settings.theme_accent_color || '#f7b700'} onChange={e=>setSettings({...settings, theme_accent_color: e.target.value})} />
                        <input type="text" className="flex-grow border rounded-lg p-2 text-sm" value={settings.theme_accent_color || ''} onChange={e=>setSettings({...settings, theme_accent_color: e.target.value})} placeholder="#f7b700" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Custom Theme Gradient (কাস্টম গ্রেডিয়েন্ট)</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm" value={settings.theme_gradient || ''} onChange={e=>setSettings({...settings, theme_gradient: e.target.value})} placeholder="linear-gradient(135deg, #2d4b3e, #f7b700)" />
                    <p className="text-[10px] text-gray-500 mt-1">This gradient will be used for hero banners and special headers. E.g. <code>linear-gradient(135deg, #2d4b3e, #f7b700)</code></p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="block text-xs font-bold text-gray-600 mb-2">Preset Palettes (থিম প্রিসেটসমূহ)</span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSettings({...settings, theme_primary_color: '#2d4b3e', theme_accent_color: '#f7b700', theme_gradient: '#fefce8'})} className="px-3 py-1 bg-[#2d4b3e] text-[#f7b700] text-xs font-bold rounded hover:opacity-90 border">Default (Template Theme)</button>
                      <button type="button" onClick={() => setSettings({...settings, theme_primary_color: '#7f1d1d', theme_accent_color: '#f59e0b', theme_gradient: '#fff5f5'})} className="px-3 py-1 bg-[#7f1d1d] text-[#f59e0b] text-xs font-bold rounded hover:opacity-90 border">Rosewood & Amber</button>
                      <button type="button" onClick={() => setSettings({...settings, theme_primary_color: '#1e3a8a', theme_accent_color: '#10b981', theme_gradient: '#f0f9ff'})} className="px-3 py-1 bg-[#1e3a8a] text-[#10b981] text-xs font-bold rounded hover:opacity-90 border">Midnight Blue & Teal</button>
                      <button type="button" onClick={() => setSettings({...settings, theme_primary_color: '#4c1d95', theme_accent_color: '#ec4899', theme_gradient: '#faf5ff'})} className="px-3 py-1 bg-[#4c1d95] text-[#ec4899] text-xs font-bold rounded hover:opacity-90 border">Royal Purple & Pink</button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Mode</label>
                  <select className="w-full border rounded-lg p-2" value={settings.store_mode} onChange={e=>setSettings({...settings, store_mode: e.target.value})}>
                    <option value="Single Product">Single Product</option>
                    <option value="Multi Product">Multi Product</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Store Language</label>
                  <select className="w-full border rounded-lg p-2" value={settings.default_language} onChange={e=>setSettings({...settings, default_language: e.target.value})}>
                    <option value="Bangla">Bangla</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold border-b pb-2">Delivery Charges Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inside Dhaka (৳)</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={settings.delivery_inside_dhaka} onChange={e=>setSettings({...settings, delivery_inside_dhaka: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outside Dhaka (৳)</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={settings.delivery_outside_dhaka} onChange={e=>setSettings({...settings, delivery_outside_dhaka: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Amount Threshold (৳)</label>
                <input type="number" className="w-full border rounded-lg p-2" value={settings.free_delivery_threshold} onChange={e=>setSettings({...settings, free_delivery_threshold: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">Set to 0 to disable free delivery.</p>
              </div>

              {/* Fraud Check Settings */}
              <div className="border-b pb-3 pt-6">
                <h2 className="text-lg font-bold text-gray-800">Advance Payment Settings (অগ্রিম পেমেন্ট সেটিংস)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure bKash/Nagad/Rocket advance payment requirements for customers during checkout.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Enable Advance Payment to Confirm Order (অগ্রিম পেমেন্ট আবশ্যক করুন)</h3>
                    <p className="text-xs text-gray-500">Require buyers to pay the advance amount (delivery charge or custom fee) to place an order.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.fraud_check_enabled === 'true'} 
                      onChange={e => setSettings({ ...settings, fraud_check_enabled: e.target.checked ? 'true' : 'false' })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d4b3e]"></div>
                  </label>
                </div>

                {settings.fraud_check_enabled === 'true' && (
                  <>

                    <div className="border-t pt-4">
                      <label className="block text-xs font-bold text-gray-600 mb-2">ENABLED ADVANCE PAYMENT METHODS (অগ্রিম পেমেন্ট মাধ্যমসমূহ)</label>
                      <div className="flex flex-wrap gap-4 mt-1.5 mb-3">
                        {['bkash', 'nagad', 'rocket'].map(method => {
                          const activeMethods = (settings.advance_payment_methods || 'bkash,nagad,rocket').split(',');
                          const isChecked = activeMethods.includes(method);
                          return (
                            <label key={method} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-700 capitalize bg-white border px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e]" 
                                checked={isChecked} 
                                onChange={e => {
                                  let newMethods;
                                  if (e.target.checked) {
                                    newMethods = [...activeMethods, method];
                                  } else {
                                    newMethods = activeMethods.filter(m => m !== method);
                                  }
                                  if (newMethods.length === 0) newMethods = [method];
                                  setSettings({ ...settings, advance_payment_methods: newMethods.join(',') });
                                }}
                              />
                              <span>{method === 'bkash' ? 'bKash (বিকাশ)' : method === 'nagad' ? 'Nagad (নগদ)' : 'Rocket (রকেট)'}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-xs font-bold text-gray-600 mb-1">ADVANCE PAYMENT ACCOUNT NUMBER (অগ্রিম পেমেন্ট গ্রহণকারী নাম্বার)</label>
                      <input 
                        type="text" 
                        className="w-full border rounded-lg p-2.5 bg-white outline-none text-sm" 
                        value={settings.fraud_advance_payment_number || ''} 
                        onChange={e => setSettings({ ...settings, fraud_advance_payment_number: e.target.value })} 
                        placeholder="017XXXXXXXX (bKash/Nagad)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">ADVANCE AMOUNT TYPE (অগ্রিম পেমেন্টের ধরণ)</label>
                        <select 
                          className="w-full border rounded-lg p-2.5 bg-white outline-none text-sm cursor-pointer font-semibold"
                          value={settings.fraud_advance_amount_type || 'delivery_charge'}
                          onChange={e => setSettings({ ...settings, fraud_advance_amount_type: e.target.value })}
                        >
                          <option value="delivery_charge">Match Delivery Charge (ডেলিভারি চার্জের সমান)</option>
                          <option value="custom">Fixed Custom Amount (নির্দিষ্ট পরিমাণ টাকা)</option>
                        </select>
                      </div>

                      {settings.fraud_advance_amount_type === 'custom' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">CUSTOM ADVANCE AMOUNT (৳) (নির্দিষ্ট টাকার পরিমাণ)</label>
                          <input 
                            type="number" 
                            className="w-full border rounded-lg p-2.5 bg-white outline-none text-sm" 
                            value={settings.fraud_advance_custom_amount || '150'} 
                            onChange={e => setSettings({ ...settings, fraud_advance_custom_amount: e.target.value })} 
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ADVANCE INSTRUCTIONS FOR CUSTOMERS (কাস্টমারের জন্য পেমেন্ট নির্দেশিকা)</label>
                      <textarea 
                        rows="3" 
                        className="w-full border rounded-lg p-2.5 bg-white outline-none text-sm" 
                        value={settings.fraud_advance_instructions || ''} 
                        onChange={e => setSettings({ ...settings, fraud_advance_instructions: e.target.value })} 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8 max-w-4xl">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Social Media & Communication Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage the storefront social links, WhatsApp floating widget, and social badges.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="font-bold text-gray-850 flex items-center gap-2 text-sm text-[#2d4b3e]">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow"></span> Core Social Pages
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook Page URL</label>
                  <input type="url" className="w-full border rounded-lg p-2.5 bg-white shadow-sm focus:ring-1 focus:ring-[#2d4b3e] outline-none transition" value={settings.social_facebook} onChange={e=>setSettings({...settings, social_facebook: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram URL</label>
                  <input type="url" className="w-full border rounded-lg p-2.5 bg-white shadow-sm focus:ring-1 focus:ring-[#2d4b3e] outline-none transition" value={settings.social_instagram} onChange={e=>setSettings({...settings, social_instagram: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="font-bold text-gray-850 flex items-center gap-2 text-sm text-[#2d4b3e]">
                    <span className="w-2 h-2 rounded-full bg-[#2d4b3e]"></span> WhatsApp Floating Widget
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="text" className="w-full border rounded-lg p-2.5 bg-white shadow-sm focus:ring-1 focus:ring-[#2d4b3e] outline-none transition" value={settings.whatsapp_number} onChange={e=>setSettings({...settings, whatsapp_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Default Message</label>
                  <input type="text" className="w-full border rounded-lg p-2.5 bg-white shadow-sm focus:ring-1 focus:ring-[#2d4b3e] outline-none transition" value={settings.whatsapp_message} onChange={e=>setSettings({...settings, whatsapp_message: e.target.value})} />
                </div>
              </div>

              {/* Dynamic Social Links Manager */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Social Media Links (সোশ্যাল মিডিয়া লিংক)</h3>
                    <p className="text-xs text-gray-500">Add custom social handles that will be shown in the footer with dynamic icons.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newLink = { name: 'Facebook', url: 'https://facebook.com/ghanibd', status: 'Show' };
                      updateSocialLinks([...socialLinks, newLink]);
                    }}
                    className="bg-[#2d4b3e] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
                  >
                    + Add New Link
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No social media links added yet. Click "+ Add New Link" above to start.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialLinks.map((link, idx) => {
                      const renderPreviewIcon = (name) => {
                        const lower = (name || '').toLowerCase();
                        if (lower.includes('facebook')) return <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>;
                        if (lower.includes('instagram')) return <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="0.5"/></g>;
                        if (lower.includes('youtube')) return <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>;
                        if (lower === 'x' || lower.includes('twitter')) return <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>;
                        if (lower.includes('linkedin')) return <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" fill="currentColor"/>;
                        if (lower.includes('pinterest')) return <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.43-6.07 1.43-6.07s-.36-.73-.36-1.8c0-1.68.97-2.94 2.19-2.94 1.03 0 1.53.78 1.53 1.7 0 1.04-.66 2.6-1 4.04-.29 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.07-4.9-5.03-4.9-3.43 0-5.44 2.57-5.44 5.22 0 1.04.4 2.15.9 2.75.1.12.11.23.08.35l-.33 1.34c-.05.22-.17.27-.4.16-1.5-.7-2.44-2.88-2.44-4.63 0-3.77 2.74-7.23 7.9-7.23 4.14 0 7.37 2.95 7.37 6.9 0 4.12-2.6 7.43-6.2 7.43-1.2 0-2.35-.63-2.73-1.37l-.75 2.85c-.27 1.04-1 2.35-1.5 3.16C10.74 23.83 11.36 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" fill="currentColor"/>;
                        if (lower.includes('tiktok')) return <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.17 1.02.89 2.34 1.48 3.72 1.62.01 1.3-.01 2.6.01 3.89-.96-.03-1.92-.26-2.8-.68-.86-.45-1.62-1.09-2.22-1.85v5.33c.01 1.68-.45 3.32-1.34 4.74-.91 1.25-2.22 2.16-3.71 2.6-1.46.4-3 .31-4.4-.27-1.41-.67-2.55-1.84-3.21-3.28-.7-1.7-.64-3.66.17-5.3.74-1.33 1.98-2.37 3.44-2.88 1.4-.41 2.89-.28 4.2.36v3.91c-.72-.34-1.52-.47-2.3-.37-.76.12-1.47.51-1.98 1.09-.58.7-.84 1.62-.71 2.53.13.84.6 1.59 1.3 2.05.77.47 1.7.57 2.55.26.83-.34 1.5-1 1.83-1.83.18-.54.24-1.12.22-1.7V.02z" fill="currentColor"/>;
                        if (lower.includes('threads')) return <path d="M12.75 2c5.937 0 10.75 4.813 10.75 10.75S18.687 23.5 12.75 23.5 2 18.687 2 12.75 6.813 2 12.75 2zm1.889 15.35c.801 0 1.48-.198 2.037-.594a3.8 3.8 0 0 0 1.305-1.616c.321-.806.481-1.748.481-2.827V9.62c0-1.118-.184-2.072-.553-2.864a4.195 4.195 0 0 0-1.558-1.884C15.589 4.382 14.595 4 13.376 4c-1.344 0-2.443.435-3.298 1.306-.856.871-1.284 2.033-1.284 3.486v1.942c0 .77.108 1.455.326 2.057.218.602.555 1.082 1.01 1.442.455.36 1.018.54 1.69.54.542 0 .993-.11 1.353-.332.36-.222.625-.522.793-.9.123.36.335.65.637.873.301.222.68.333 1.138.333z" fill="currentColor"/>;
                        if (lower.includes('snapchat')) return <path d="M12 .002c-1.657 0-3.313.328-4.57 1.02-.924.508-1.533 1.258-1.533 2.062 0 .504.256.97.747 1.332C7.228 4.857 7.9 5 8.5 5c.422 0 .828-.078 1.2-.232l.707.994c-.452.41-.807.828-1.037 1.256-.253.468-.37.954-.37 1.482 0 1.2.98 2 2.5 2 .748 0 1.365-.184 1.838-.544l.872 1.398c-.687.56-1.5.846-2.41.846-2.528 0-4.3-1.636-4.3-4.1 0-.904.234-1.748.7-2.532C6.73 3.636 5 2 5 .7c0-2.3 2.72-3.7 7-3.7s7 1.4 7 3.7c0 1.336-1.73 2.936-3.2 4.186.466.784.7 1.628.7 2.532 0 2.464-1.772 4.1-4.3 4.1-.91 0-1.723-.286-2.41-.846l.872-1.398c.473.36 1.09.544 1.838.544 1.52 0 2.5-.8 2.5-2 0-.528-.117-1.014-.37-1.482-.23-.428-.585-.846-1.037-1.256l.707-.994c.372.154.778.232 1.2.232.6 0 1.272-.143 1.856-.584.49-.362.747-.828.747-1.332 0-.804-.61-1.554-1.533-2.062C15.313.33 13.657.002 12 .002z" fill="currentColor"/>;
                        if (lower.includes('whatsapp')) return <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>;
                        if (lower.includes('telegram')) return <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.93 9.09c-.14.65-.53.81-1.08.5l-2.94-2.17-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.22-.05-.34-.37-.13l-6.78 4.27-2.92-.91c-.64-.2-.65-.64.13-.94l11.39-4.39c.53-.19.99.13.82.94z" fill="currentColor"/>;
                        if (lower.includes('gmail') || lower.includes('email') || lower.includes('mail')) return <g fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></g>;
                        if (lower.includes('reddit')) return <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-.762 1.156c.037.2.057.404.057.61 0 1.764-2.1 3.2-4.688 3.2-2.589 0-4.689-1.436-4.689-3.2 0-.2.02-.4.053-.598A1.25 1.25 0 0 1 7.24 6c0-.688.562-1.25 1.25-1.25a1.24 1.24 0 0 1 .958.455c1.02-.387 2.378-.636 3.864-.67l.82-2.576 2.668.568c.026-.532.463-.952.998-.952a1.002 1.002 0 0 1 1.001 1c0 .554-.447 1.002-1.001 1.002-.519 0-.943-.396-.992-.907l-2.39-.508-.718 2.27c1.517.026 2.9.278 3.937.67a1.23 1.23 0 0 1 .958-.444zM9.5 9c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm5 0c-.553 0-1-.448-1-1s.447-1 1-1 1 .448 1 1-.447 1-1 1zm-4.99 3.012c.113 0 .22.046.3.125.753.753 2.127.753 2.88 0a.426.426 0 0 1 .6 0 .426.426 0 0 1 0 .6c-1.085 1.085-2.995 1.085-4.08 0a.426.426 0 0 1 0-.6.426.426 0 0 1 .3-.125z" fill="currentColor"/>;
                        return <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></g>;
                      };

                      const handlePresetChange = (nameVal) => {
                        const presets = {
                          'Facebook': 'https://facebook.com/ghanibd',
                          'Instagram': 'https://instagram.com/ghanibd',
                          'X': 'https://x.com/ghanibd',
                          'YouTube': 'https://youtube.com/@ghanibd',
                          'LinkedIn': 'https://linkedin.com/company/ghanibd',
                          'Pinterest': 'https://pinterest.com/ghanibd',
                          'TikTok': 'https://tiktok.com/@ghanibd',
                          'Threads': 'https://threads.net/@ghanibd',
                          'Snapchat': 'https://snapchat.com/add/ghanibd',
                          'WhatsApp': 'https://wa.me/8801711223344',
                          'Telegram': 'https://t.me/ghanibd',
                          'Website': 'https://ghanibd.com',
                          'Gmail': 'mailto:support@ghanibd.com',
                          'Reddit': 'https://reddit.com/user/ghanibd'
                        };
                        const updated = [...socialLinks];
                        updated[idx].name = nameVal;
                        if (presets[nameVal]) {
                          updated[idx].url = presets[nameVal];
                        }
                        updateSocialLinks(updated);
                      };

                      return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200">
                          <div className="flex items-center gap-3 border-b pb-3 mb-4">
                            <div className="p-2.5 bg-[#2d4b3e]/10 text-[#2d4b3e] rounded-xl">
                              <svg className="w-6 h-6" viewBox="0 0 24 24">
                                {renderPreviewIcon(link.name)}
                              </svg>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-bold text-gray-800 text-sm leading-tight">{link.name || 'Select Platform'}</h4>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Active Integration</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${link.status === 'Show' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {link.status === 'Show' ? 'Live' : 'Hidden'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 mb-1">PLATFORM</label>
                              <select 
                                required
                                className="w-full text-xs font-semibold border rounded-lg p-2 bg-gray-50 outline-none cursor-pointer" 
                                value={link.name} 
                                onChange={e => handlePresetChange(e.target.value)} 
                              >
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="X">X (Twitter)</option>
                                <option value="YouTube">YouTube</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Pinterest">Pinterest</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Threads">Threads</option>
                                <option value="Snapchat">Snapchat</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Telegram">Telegram</option>
                                <option value="Website">Website</option>
                                <option value="Gmail">Gmail (Email)</option>
                                <option value="Reddit">Reddit</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 mb-1">DESTINATION URL / EMAIL</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="https://..."
                                className="w-full text-xs border rounded-lg p-2 outline-none font-medium bg-gray-50 focus:bg-white transition" 
                                value={link.url} 
                                onChange={e => handleSocialLinkChange(idx, 'url', e.target.value)} 
                              />
                            </div>

                            <div className="flex gap-2 pt-2 border-t mt-2">
                              <div className="flex-grow">
                                <select 
                                  className="w-full text-xs border rounded-lg p-1.5 font-bold outline-none cursor-pointer bg-white text-gray-700" 
                                  value={link.status} 
                                  onChange={e => handleSocialLinkChange(idx, 'status', e.target.value)}
                                >
                                  <option value="Show">Show (দেখাবে)</option>
                                  <option value="Hide">Hide (লুকাবে)</option>
                                </select>
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeSocialLink(idx)}
                                className="text-red-500 hover:bg-red-50 hover:text-red-700 p-1.5 rounded-lg transition border border-transparent hover:border-red-200"
                                title="Remove Integration"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-bold border-b pb-2">SMTP Server Config (For Emails)</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.smtp_host} onChange={e=>setSettings({...settings, smtp_host: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.smtp_port} onChange={e=>setSettings({...settings, smtp_port: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username/Email</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={settings.smtp_user} onChange={e=>setSettings({...settings, smtp_user: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border rounded-lg p-2" value={settings.smtp_pass} onChange={e=>setSettings({...settings, smtp_pass: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
                  <select className="w-full border rounded-lg p-2" value={settings.smtp_encryption} onChange={e=>setSettings({...settings, smtp_encryption: e.target.value})}>
                    <option value="None">None</option>
                    <option value="SSL">SSL</option>
                    <option value="TLS">TLS</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quicklinks' && (
            <QuicklinksManagement />
          )}
        </div>
      </div>
    </div>
  );
}
