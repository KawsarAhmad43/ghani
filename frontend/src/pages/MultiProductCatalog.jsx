import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MultiProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678'
  });

  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    // Load Settings
    axios.get(`${API_URL}/api/settings`)
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(console.error);

    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
      const count = savedCart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    const savedUser = localStorage.getItem('customer_user');
    if (savedUser) {
      setCustomerUser(JSON.parse(savedUser));
    }

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, bannerRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/banners`)
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setBanners(bannerRes.data || []);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProcessedProducts = () => {
    let processed = activeCategory === 'all'
      ? products
      : products.filter(p => p.category_id === parseInt(activeCategory));

    if (searchQuery.trim() !== '') {
      processed = processed.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    processed = [...processed].sort((a, b) => {
      if (sortOption === 'price_asc') {
        return a.price - b.price;
      } else if (sortOption === 'price_desc') {
        return b.price - a.price;
      } else if (sortOption === 'oldest') {
        return a.id - b.id;
      } else { // 'newest'
        return b.id - a.id;
      }
    });

    return processed;
  };

  const processedProducts = getProcessedProducts();

  const renderSocialIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('facebook')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
        </svg>
      );
    }
    if (lower.includes('instagram')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    }
    if (lower.includes('youtube')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
        </svg>
      );
    }
    if (lower.includes('twitter') || lower.includes('x')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-green font-bold">
        লোডিং হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <style>{`
        .bg-brand-green { background-color: var(--brand-green); }
        .text-brand-green { color: var(--brand-green); }
        .bg-brand-yellow { background-color: var(--brand-yellow); }
      `}</style>

      {/* Reusable Header */}
      <Header />

      {/* Premium Header/Title section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-brand-green mb-2">আমাদের পণ্য সমূহ</h1>
          <p className="text-gray-500 text-sm md:text-base font-semibold">১০০% খাঁটি ও প্রাকৃতিক পণ্যের সেরা সংগ্রহ</p>
          <div className="w-24 h-1.5 bg-brand-yellow mx-auto mt-4 rounded-full"></div>
        </div>
      </section>

      {/* Catalog & Categories */}
      <section id="catalog" className="py-12 flex-grow">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar / Category Filter */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-extrabold text-lg mb-4 text-[#2d4b3e]">ক্যাটাগরি সমূহ</h3>
                <div className="flex flex-wrap md:flex-col gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all ${
                      activeCategory === 'all'
                        ? 'bg-[#2d4b3e] text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    সকল পণ্য
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id.toString())}
                      className={`px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all ${
                        activeCategory === cat.id.toString()
                          ? 'bg-[#2d4b3e] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-grow">
              {/* Search and Sorting controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-xl border">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="পণ্য খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-gray-50/50 text-sm font-semibold"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <label className="text-sm font-bold text-gray-600 whitespace-nowrap">সর্টিং করুন:</label>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                  >
                    <option value="newest">নতুন থেকে পুরাতন</option>
                    <option value="oldest">পুরাতন থেকে নতুন</option>
                    <option value="price_asc">মূল্য: কম থেকে বেশি</option>
                    <option value="price_desc">মূল্য: বেশি থেকে কম</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl">
                  {activeCategory === 'all' 
                    ? 'সকল পণ্য তালিকা' 
                    : categories.find(c => c.id.toString() === activeCategory)?.name || 'পণ্য তালিকা'}
                </h3>
                <p className="text-sm text-gray-500">মোট {processedProducts.length} টি পণ্য পাওয়া গেছে</p>
              </div>

              {processedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedProducts.map(product => (
                    <div key={product.id} className="bg-white p-6 rounded-xl border flex flex-col justify-between hover:shadow-lg transition">
                      <div>
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-44 w-full object-contain mb-4 rounded-lg bg-gray-50 p-2" />
                        ) : (
                          <div className="h-44 w-full bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h2>
                        <div className="flex items-center gap-1 my-1 text-xs text-yellow-500 justify-start">
                          {'★'.repeat(Math.round(product.rating_avg || 5))}
                          {'☆'.repeat(5 - Math.round(product.rating_avg || 5))}
                          <span className="text-[10px] text-gray-400 ml-1 font-semibold">({product.rating_count || 0})</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3 mt-1">{product.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-500 text-xs">মূল্য:</span>
                          <span className="text-brand-green font-extrabold text-xl">৳{product.price}</span>
                        </div>
                        <Link to={`/product/${product.slug || product.id}`} className="w-full bg-[#2d4b3e] text-white py-3 rounded-lg font-bold text-center block hover:opacity-90 transition">
                          পণ্য দেখুন
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-xl border text-gray-500">
                  কোন পণ্য পাওয়া যায়নি।
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}
