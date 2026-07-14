import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Download, Image as ImageIcon, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [search, setSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    name: '', price: '', image: '', category_id: '',
    description: '', short_description: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    ingredients: '', prep_method: '', shelf_life: '', source: '',
    offer_type: 'none', free_gift_text: '',
    variants: [], attributes: [],
    slug: ''
  });

  const [hasOffer, setHasOffer] = useState(false);
  const [showOptional, setShowOptional] = useState({
    ingredients: false, prep_method: false, shelf_life: false, source: false
  });

  const [selectedVariantType, setSelectedVariantType] = useState('Weight');
  const [newVariant, setNewVariant] = useState({ name: '', price: '', stock: '', sku: '', image: '', status: 'active', offer_price: '' });
  const [newAttr, setNewAttr] = useState({ key: '', value: '' });

  const [uploading, setUploading] = useState(false);

  // Category management states
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`)) {
      try {
        await Promise.all(selectedProductIds.map(id => axios.delete(`${API_URL}/api/admin/products/${id}`)));
        toast.success('Selected products deleted successfully!');
        setSelectedProductIds([]);
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete some products');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    axios.get(`${API_URL}/api/products`).then(res => setProducts(res.data)).catch(console.error);
  };

  const fetchSettings = () => {
    axios.get(`${API_URL}/api/admin/settings`).then(res => setSettings(res.data || {})).catch(console.error);
  };

  const fetchCategories = () => {
    axios.get(`${API_URL}/api/admin/categories`).then(res => setCategories(res.data || [])).catch(console.error);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.warning('Category name cannot be empty');
      return;
    }
    const slug = generateSlug(newCategoryName);
    axios.post(`${API_URL}/api/admin/categories`, { name: newCategoryName.trim(), slug })
      .then(() => {
        toast.success('Category added successfully!');
        setNewCategoryName('');
        fetchCategories();
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to add category');
      });
  };

  const handleDeleteCategory = (catId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      axios.delete(`${API_URL}/api/admin/categories/${catId}`)
        .then(() => {
          toast.success('Category deleted successfully!');
          fetchCategories();
        })
        .catch(err => {
          console.error(err);
          toast.error('Failed to delete category');
        });
    }
  };

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0980-\u09FFa-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleSelectAsActiveSingle = (productId) => {
    axios.post(`${API_URL}/api/admin/settings`, { single_product_id: productId })
      .then(() => {
        toast.success('Active single product updated successfully!');
        fetchSettings();
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to update active single product');
      });
  };

  const handleFileUpload = async (file) => {
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      return res.data.url;
    } catch (err) {
      toast.error('Image upload failed');
      setUploading(false);
      return null;
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();

    const isSingleProductMode = settings.store_mode === 'single' || settings.store_mode === 'Single Product';
    const isAddDisabled = isSingleProductMode && products.length >= 1;
    if (!editingId && isAddDisabled) {
      toast.warning('You cannot add more than one product in Single Product Mode.');
      return;
    }

    const request = editingId
      ? axios.put(`${API_URL}/api/admin/products/${editingId}`, formData)
      : axios.post(`${API_URL}/api/admin/products`, formData);

    request
      .then(() => {
        toast.success(editingId ? 'Product updated successfully!' : 'Product saved successfully!');
        setView('list');
        setEditingId(null);
        setFormData({
          name: '', price: '', image: '', category_id: '',
          description: '', short_description: '',
          seo_title: '', seo_description: '', seo_keywords: '',
          ingredients: '', prep_method: '', shelf_life: '', source: '',
          offer_type: 'none', free_gift_text: '',
          variants: [], attributes: [],
          slug: ''
        });
        setHasOffer(false);
        setShowOptional({
          ingredients: false, prep_method: false, shelf_life: false, source: false
        });
        fetchProducts();
      })
      .catch(err => toast.error('Error saving product: ' + err.message));
  };

  const handleEditClick = (product) => {
    axios.get(`${API_URL}/api/products/${product.id}`)
      .then(res => {
        const p = res.data;
        setFormData({
          name: p.name || '',
          price: p.price || '',
          image: p.image || '',
          category_id: p.category_id || '',
          description: p.description || '',
          short_description: p.short_description || '',
          seo_title: p.seo_title || '',
          seo_description: p.seo_description || '',
          seo_keywords: p.seo_keywords || '',
          ingredients: p.ingredients || '',
          prep_method: p.prep_method || '',
          shelf_life: p.shelf_life || '',
          source: p.source || '',
          offer_type: p.offer_type || 'none',
          free_gift_text: p.free_gift_text || '',
          variants: p.variants || [],
          attributes: p.attributes || [],
          slug: p.slug || ''
        });
        setHasOffer(p.offer_type && p.offer_type !== 'none');
        setShowOptional({
          ingredients: !!p.ingredients,
          prep_method: !!p.prep_method,
          shelf_life: !!p.shelf_life,
          source: !!p.source
        });
        setEditingId(p.id);
        setView('add');
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load product details for editing');
      });
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.price) {
      toast.warning("Variant value and price are required!");
      return;
    }
    setFormData({
      ...formData,
      variants: [...formData.variants, { ...newVariant, variant_type: selectedVariantType }]
    });
    setNewVariant({ name: '', price: '', stock: '', sku: '', image: '', status: 'active', offer_price: '' });
  };

  const deleteVariant = (indexToRemove) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const exportCSV = () => {
    const headers = "ID,Name,Price,Category\n";
    const rows = products.map(p => `${p.id},"${p.name}",${p.price},${p.category_id || ''}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  if (view === 'add') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-5xl mx-auto mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            onClick={() => {
              setView('list');
              setEditingId(null);
              setFormData({
                name: '', price: '', image: '', category_id: '',
                description: '', short_description: '',
                seo_title: '', seo_description: '', seo_keywords: '',
                ingredients: '', prep_method: '', shelf_life: '', source: '',
                offer_type: 'none', free_gift_text: '',
                variants: [], attributes: [],
                slug: ''
              });
              setHasOffer(false);
              setShowOptional({
                ingredients: false, prep_method: false, shelf_life: false, source: false
              });
            }}
            className="text-gray-500 hover:text-gray-800 font-bold"
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-8">
          {/* BASE INFO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input required type="text" className="mt-1 block w-full border rounded-md p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">URL Slug (Optional - auto-generated if empty)</label>
              <input type="text" className="mt-1 block w-full border rounded-md p-2" placeholder="e.g. natural-mustard-oil" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Base Price (৳)</label>
              <input required type="number" className="mt-1 block w-full border rounded-md p-2" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Category (ক্যাটাগরি)</label>
              <select
                className="mt-1 block w-full border rounded-md p-2 bg-white"
                value={formData.category_id || ''}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">No Category (কোনো ক্যাটাগরি নেই)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Short Description (সংক্ষিপ্ত বিবরণ)</label>
              <textarea className="mt-1 block w-full border rounded-md p-2" rows="2" placeholder="সংক্ষিপ্ত বিবরণ লিখুন..." value={formData.short_description || ''} onChange={e => setFormData({ ...formData, short_description: e.target.value })} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
              <ReactQuill theme="snow" modules={modules} value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} className="bg-white h-48 mb-12" />
            </div>

            <div className="col-span-2 p-4 border rounded-lg bg-gray-50 flex items-center gap-4">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded shadow" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                  <span className="text-xs mt-1">No Image</span>
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Main Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#2d4b3e] file:text-white hover:file:opacity-90"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const url = await handleFileUpload(e.target.files[0]);
                      if (url) setFormData({ ...formData, image: url });
                    }
                  }}
                />
                {uploading && <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse">Compressing and Uploading...</p>}
              </div>
            </div>
          </div>

          {/* OFFERS SECTION */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
            <h3 className="text-lg font-bold text-orange-800 mb-4">Product Offers & Discounts</h3>
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input type="checkbox" className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" checked={hasOffer} onChange={e => {
                setHasOffer(e.target.checked);
                setFormData({ ...formData, offer_type: e.target.checked ? 'price_discount' : 'none' });
              }} />
              <span className="font-bold text-gray-800">Available Offer?</span>
            </label>

            {hasOffer && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                  <select className="border rounded p-2 bg-white w-full max-w-sm" value={formData.offer_type} onChange={e => setFormData({ ...formData, offer_type: e.target.value })}>
                    <option value="price_discount">Price Discount</option>
                    <option value="free_delivery">Free Home Delivery</option>
                    <option value="free_gift">Free Gift (পণ্য উপহার)</option>
                  </select>
                  {formData.offer_type === 'price_discount' && (
                    <p className="text-xs text-orange-700 mt-2 font-medium">You can set specific offer prices for each variant in the Variant configuration section below.</p>
                  )}
                </div>
                {formData.offer_type === 'free_gift' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Gift Detail (ফ্রি উপহারের নাম)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. ১টি ১00ml তেল বোতল ফ্রি!"
                      className="border rounded p-2 bg-white w-full max-w-sm"
                      value={formData.free_gift_text || ''}
                      onChange={e => setFormData({ ...formData, free_gift_text: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OPTIONAL FIELDS */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Additional Specifications (Optional)</h3>
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOptional.ingredients} onChange={e => setShowOptional({ ...showOptional, ingredients: e.target.checked })} />
                <span className="text-sm font-medium">উপাদান (Ingredients)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOptional.prep_method} onChange={e => setShowOptional({ ...showOptional, prep_method: e.target.checked })} />
                <span className="text-sm font-medium">প্রস্তুত প্রণালী (Prep Method)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOptional.shelf_life} onChange={e => setShowOptional({ ...showOptional, shelf_life: e.target.checked })} />
                <span className="text-sm font-medium">সংরক্ষণকাল (Shelf Life)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOptional.source} onChange={e => setShowOptional({ ...showOptional, source: e.target.checked })} />
                <span className="text-sm font-medium">উৎস (Source)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showOptional.ingredients && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">উপাদান (Ingredients)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} />
                </div>
              )}
              {showOptional.prep_method && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">প্রস্তুত প্রণালী (Preparation Method)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.prep_method} onChange={(e) => setFormData({ ...formData, prep_method: e.target.value })} />
                </div>
              )}
              {showOptional.shelf_life && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">সংরক্ষণকাল (Shelf Life)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.shelf_life} onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })} />
                </div>
              )}
              {showOptional.source && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">উৎস (Source)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
                </div>
              )}
            </div>
          </div>

          {/* ADVANCED VARIANTS */}
          <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Product Variants</h3>

            <div className="mb-6 flex items-center gap-4">
              <label className="font-medium text-sm">Select Variant Type to Add:</label>
              <select
                className="border rounded p-2 bg-white min-w-[200px]"
                value={selectedVariantType}
                onChange={(e) => setSelectedVariantType(e.target.value)}
              >
                <option value="Weight">Weight (e.g. 1kg, 2kg, 5kg)</option>
                <option value="Color">Color (e.g. Red, Blue, Green)</option>
                <option value="Size">Size (e.g. S, M, L, XL)</option>
              </select>
            </div>

            {formData.variants.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="font-bold text-sm text-gray-600 border-b pb-2">Configured Variants:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-white border shadow-sm rounded relative">
                      <button type="button" onClick={() => deleteVariant(i)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                      <div className="font-bold text-blue-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs uppercase">{v.variant_type}</span>
                        {v.name}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 text-sm">
                        <div><span className="text-gray-500">Price:</span> ৳{v.price}</div>
                        {v.offer_price && <div className="text-orange-600 font-bold"><span className="text-gray-500 font-normal">Offer:</span> ৳{v.offer_price}</div>}
                        <div><span className="text-gray-500">Stock:</span> {v.stock}</div>
                        <div><span className="text-gray-500">Status:</span> {v.status === 'active' ? <span className="text-green-600 font-medium">Active</span> : <span className="text-red-600 font-medium">Inactive</span>}</div>
                      </div>
                      {v.image && <img src={v.image} alt={v.name} className="w-10 h-10 object-cover mt-2 rounded border" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-4 border rounded-lg shadow-sm">
              <h4 className="font-bold text-sm text-gray-700 mb-3">Add {selectedVariantType} Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div><label className="text-xs font-bold text-gray-600">Value (e.g. 1kg, Red)</label><input type="text" className="w-full border rounded p-2 text-sm mt-1" value={newVariant.name} onChange={e => setNewVariant({ ...newVariant, name: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-600">Regular Price (৳)</label><input type="number" className="w-full border rounded p-2 text-sm mt-1" value={newVariant.price} onChange={e => setNewVariant({ ...newVariant, price: e.target.value })} /></div>

                {formData.offer_type === 'price_discount' && (
                  <div><label className="text-xs font-bold text-orange-600">Offer Price (৳)</label><input type="number" className="w-full border-orange-300 rounded p-2 text-sm mt-1 focus:ring-orange-500" value={newVariant.offer_price} onChange={e => setNewVariant({ ...newVariant, offer_price: e.target.value })} /></div>
                )}

                <div><label className="text-xs font-bold text-gray-600">Stock Limit</label><input type="number" className="w-full border rounded p-2 text-sm mt-1" value={newVariant.stock} onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })} /></div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Variant Image (Upload)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs w-full text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const url = await handleFileUpload(e.target.files[0]);
                          if (url) setNewVariant({ ...newVariant, image: url });
                        }
                      }}
                    />
                    {newVariant.image && <span className="text-xs text-green-600 whitespace-nowrap">✔ Uploaded</span>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="variant_status" checked={newVariant.status === 'active'} onChange={() => setNewVariant({ ...newVariant, status: 'active' })} /> Active</label>
                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="variant_status" checked={newVariant.status === 'inactive'} onChange={() => setNewVariant({ ...newVariant, status: 'inactive' })} /> Inactive</label>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-4 flex justify-end mt-4">
                  <button type="button" onClick={addVariant} className="bg-[#2d4b3e] text-white px-6 py-2 rounded font-bold hover:opacity-90 flex items-center gap-2"><Plus size={16} /> Add {selectedVariantType}</button>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* SEO SECTION */}
          <h3 className="text-lg font-semibold text-gray-800">SEO Friendly Data</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">SEO Title</label>
              <input type="text" className="mt-1 block w-full border rounded-md p-2" value={formData.seo_title} onChange={e => setFormData({ ...formData, seo_title: e.target.value })} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">SEO Keywords (comma separated)</label>
              <input type="text" className="mt-1 block w-full border rounded-md p-2" value={formData.seo_keywords} onChange={e => setFormData({ ...formData, seo_keywords: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">SEO Description</label>
              <textarea className="mt-1 block w-full border rounded-md p-2" rows="2" value={formData.seo_description} onChange={e => setFormData({ ...formData, seo_description: e.target.value })}></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#2d4b3e] text-white font-bold py-4 rounded-xl shadow mt-8 hover:bg-[#203a2e] transition text-lg">
            {editingId ? 'Update Entire Product' : 'Save Entire Product'}
          </button>
        </form>
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <div className="flex gap-3 items-center">
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            <Plus size={18} /> Manage Categories
          </button>
          {(() => {
            const isSingleProductMode = settings.store_mode === 'single' || settings.store_mode === 'Single Product';
            const isAddDisabled = isSingleProductMode && products.length >= 1;

            if (isAddDisabled) {
              return (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-xs font-semibold max-w-md">
                  Single Product Mode is Active. Add Product is disabled. Change Store Mode in Settings to add more.
                </div>
              );
            }

            return (
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '', price: '', image: '', category_id: '',
                    description: '', short_description: '',
                    seo_title: '', seo_description: '', seo_keywords: '',
                    ingredients: '', prep_method: '', shelf_life: '', source: '',
                    offer_type: 'none', free_gift_text: '',
                    variants: [], attributes: [],
                    slug: ''
                  });
                  setHasOffer(false);
                  setShowOptional({
                    ingredients: false, prep_method: false, shelf_life: false, source: false
                  });
                  setView('add');
                }}
                className="flex items-center gap-2 bg-[#2d4b3e] text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                <Plus size={18} /> Add Product
              </button>
            );
          })()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full max-w-md bg-gray-50 focus-within:bg-white focus-within:ring-1">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none w-full text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {selectedProductIds.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm text-red-800 font-semibold shadow-sm animate-fade-in w-full md:w-auto">
              <span>Selected {selectedProductIds.length} {selectedProductIds.length === 1 ? 'item' : 'items'}</span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-gray-550 hover:text-gray-800 text-xs underline font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="p-4 border-b w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                  />
                </th>
                <th className="p-4 border-b">Image</th>
                <th className="p-4 border-b">Product Name</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, product.id]);
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">{product.name}</td>
                  <td className="p-4 font-medium text-gray-800">৳{product.price}</td>
                  <td className="p-4 font-medium text-gray-750">
                    {categories.find(c => c.id === product.category_id)?.name || <span className="text-gray-400 italic">No Category</span>}
                  </td>
                  <td className="p-4 flex gap-2 items-center justify-end">
                    <button onClick={() => handleEditClick(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete" onClick={() => {
                      if (window.confirm('Delete this product?')) {
                        axios.delete(`${API_URL}/api/admin/products/${product.id}`).then(() => {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                          fetchProducts();
                        });
                      }
                    }}><Trash2 size={16} /></button>
                    {(() => {
                      const isSingleProductMode = settings.store_mode === 'single' || settings.store_mode === 'Single Product';
                      if (isSingleProductMode) {
                        const isActiveSingle = settings.single_product_id === product.id.toString() || settings.single_product_id === product.id;
                        if (isActiveSingle) {
                          return (
                            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">Actived As Main Product</span>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleSelectAsActiveSingle(product.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs px-2.5 py-1 rounded transition whitespace-nowrap"
                            >
                              Select as Single
                            </button>
                          );
                        }
                      }
                      return null;
                    })()}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-800 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Manage Categories (ক্যাটাগরি সমূহ)</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-650 mb-1.5 uppercase tracking-wide">Category Name (ক্যাটাগরি নাম)</label>
                <input
                  required
                  type="text"
                  placeholder="যেমন: সরিষার তেল, মধু, ইত্যাদি"
                  className="w-full text-sm rounded-lg border-gray-300 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2.5 border font-semibold outline-none"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-[#2d4b3e] hover:bg-[#203a2e] text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow flex items-center gap-1.5 h-[42px]"
              >
                <Plus size={16} /> Add (যোগ করুন)
              </button>
            </form>

            {/* Categories List */}
            <label className="block text-xs font-bold text-gray-650 mb-2.5 uppercase tracking-wide">Existing Categories (বিদ্যমান ক্যাটাগরি)</label>
            <div className="overflow-y-auto flex-1 border rounded-lg bg-gray-50/50">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 border-b">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 text-gray-500 font-mono text-xs">{cat.id}</td>
                        <td className="p-3 font-bold text-gray-900">{cat.name}</td>
                        <td className="p-3 text-gray-650 font-mono text-xs">{cat.slug}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-red-650 hover:bg-red-50 p-1.5 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-400 italic">No categories found. Add one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
