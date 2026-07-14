import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../utils/api';

export default function SEOMetaTags() {
  const toast = useToast();
  const [seo, setSeo] = useState({
    title: 'Ghani Organic Mustard Oil',
    description: 'Premium 100% natural, cold-pressed mustard oil.',
    keywords: 'mustard oil, organic oil',
    schema_markup: '{\n  "@context": "https://schema.org",\n  "@type": "Store",\n  "name": "Ghani"\n}',
    og_tags: 'Ghani Organic Mustard Oil',
    twitter_tags: 'Ghani Organic Mustard Oil'
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/seo`).then(res => {
      if(res.data.title) {
        setSeo(res.data);
      }
    });
  }, []);

  const saveSeo = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/seo`, seo);
      toast.success('SEO Settings saved successfully!');
    } catch (err) {
      toast.error('Error saving SEO');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SEO & Meta Tags Management</h1>
        <button onClick={saveSeo} className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90">
          <Save size={18} /> Save SEO Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Search className="text-blue-500" />
            <h2 className="text-lg font-bold">Homepage Standard Meta</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Page SEO Title</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e]" value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea rows="3" className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e]" value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
            <textarea rows="2" className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e]" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})}></textarea>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold border-b pb-4">Social Media (Open Graph & Twitter)</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG (Facebook) Title</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e]" value={seo.og_tags} onChange={e => setSeo({...seo, og_tags: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Meta Title</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-[#2d4b3e]" value={seo.twitter_tags} onChange={e => setSeo({...seo, twitter_tags: e.target.value})} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 md:col-span-2">
          <h2 className="text-lg font-bold border-b pb-4">Advanced Schema Markup (JSON-LD)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Homepage Schema</label>
            <textarea rows="6" className="w-full border rounded-lg p-2 font-mono text-sm bg-gray-50 focus:bg-white" value={seo.schema_markup} onChange={e => setSeo({...seo, schema_markup: e.target.value})}></textarea>
            <p className="text-xs text-gray-500 mt-2">Invalid JSON will break the schema parsing. Please validate before saving.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
