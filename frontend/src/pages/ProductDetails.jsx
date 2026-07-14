import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight, ChevronLeft, Star, CheckCircle2, Shield, Sprout, 
  ShoppingCart, Truck, CreditCard, Clock, Heart, Smile, Utensils, 
  Flame, Sparkles, HelpCircle 
} from 'lucide-react';
import API_URL from '../utils/api';
import { trackEvent } from '../utils/tracker';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const reviewsSliderRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678',
    store_mode: 'single'
  });

  const [webContent, setWebContent] = useState({
    product_advantage: [
      { id: 1, icon: 'Heart', title: 'হার্টের যত্ন', description: 'ওমেগা-৩ হার্ট সুস্থ রাখে' },
      { id: 2, icon: 'Smile', title: 'ত্বক ও চুল', description: 'প্রাকৃতিক ময়েশ্চারাইজার' },
      { id: 3, icon: 'Utensils', title: 'পরিপাক শক্তি', description: 'হজমে সাহায্য করে' }
    ],
    usage_tip: [
      { id: 1, icon: 'Flame', title: 'রান্নায় ব্যবহার', description: 'যেকোনো ভর্তা, আচার বা ঝাল খাবারে আমাদের তেলের অতুলনীয় ঝাঁঝ ও স্বাদ যোগ করুন। এটি উচ্চ তাপে রান্নার জন্য একদম নিরাপদ।' },
      { id: 2, icon: 'Sparkles', title: 'ত্বক ও চুলের যত্ন', description: 'চুলের বৃদ্ধির জন্য নিয়মিত মালিশ করুন। শীতকালে ত্বকের শুষ্কতা দূর করতে সরাসরি শরীরে ব্যবহার করা যায়।' }
    ]
  });

  useEffect(() => {
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
    // Fetch Settings
    axios.get(`${API_URL}/api/settings`)
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(err => console.error(err));

    // Fetch Website Content
    axios.get(`${API_URL}/api/website-content`)
      .then(res => {
        if (res.data) {
          setWebContent(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(err => console.error(err));

    // Fetch Product Details
    axios.get(`${API_URL}/api/products/${idOrSlug}`)
      .then(res => {
        setProduct(res.data);
        setVariants(res.data.variants || []);
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }

        trackEvent('ViewContent', {
          content_name: res.data.name,
          content_ids: [res.data.id],
          value: res.data.price,
          currency: 'BDT'
        });
      })
      .catch(err => {
        console.error('Error loading product details:', err);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  const handleBuyNow = () => {
    if (!product) return;
    const isSingle = settings.store_mode?.toLowerCase() === 'single' || settings.store_mode === 'Single Product';
    const savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
    
    if (isSingle && savedCart.length > 0) {
      const hasDifferent = savedCart.some(item => item.product_id !== product.id || item.variant_id !== (selectedVariant ? selectedVariant.id : null));
      if (hasDifferent) {
        toast.warning('your shop is single product variant store update it to Multi productstore to add more');
        return;
      }
    }

    const finalPrice = selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.price;
    
    trackEvent('InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.id],
      value: finalPrice,
      currency: 'BDT'
    });

    navigate('/checkout', {
      state: {
        checkoutItem: {
          product_id: product.id,
          name: product.name,
          image: getSelectedVariantImage(),
          price: finalPrice,
          quantity: 1,
          variant_id: selectedVariant ? selectedVariant.id : null,
          variant_name: selectedVariant ? selectedVariant.name : '',
          offer_type: product.offer_type || 'none',
          free_gift_text: product.free_gift_text || ''
        }
      }
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const isSingle = settings.store_mode?.toLowerCase() === 'single' || settings.store_mode === 'Single Product';
    const savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
    
    if (isSingle && savedCart.length > 0) {
      const hasDifferent = savedCart.some(item => item.product_id !== product.id || item.variant_id !== (selectedVariant ? selectedVariant.id : null));
      if (hasDifferent) {
        toast.warning('your shop is single product variant store update it to Multi productstore to add more');
        return;
      }
    }

    const finalPrice = selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.price;
    
    const cartItem = {
      product_id: product.id,
      name: product.name,
      image: getSelectedVariantImage(),
      price: finalPrice,
      quantity: 1,
      variant_id: selectedVariant ? selectedVariant.id : null,
      variant_name: selectedVariant ? selectedVariant.name : '',
      offer_type: product.offer_type || 'none',
      free_gift_text: product.free_gift_text || ''
    };

    const existingIndex = savedCart.findIndex(item => item.product_id === cartItem.product_id && item.variant_id === cartItem.variant_id);
    
    if (existingIndex > -1) {
      savedCart[existingIndex].quantity += 1;
    } else {
      savedCart.push(cartItem);
    }
    
    localStorage.setItem('ghani_cart', JSON.stringify(savedCart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('পণ্যটি কার্টে যুক্ত হয়েছে!');
  };


  const getVariantIndex = (variantName) => {
    if (!variantName) return 1;
    const lower = variantName.toLowerCase();
    if (lower.includes('500') || lower.includes('৫০০')) return 0;
    if (lower.includes('5') || lower.includes('৫')) return 2;
    return 1;
  };

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

  const getSelectedVariantImage = () => {
    if (selectedVariant && selectedVariant.image) {
      return selectedVariant.image;
    }
    if (product && product.image) {
      return product.image;
    }
    const idx = getVariantIndex(selectedVariant?.name);
    if (idx === 0) return '/assets/img/500ml.png';
    if (idx === 2) return '/assets/img/5l.png';
    return '/assets/img/1l.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-green font-bold">
        পণ্য লোড হচ্ছে...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">পণ্যটি পাওয়া যায়নি</h2>
        <Link to="/" className="bg-[#2d4b3e] text-white px-6 py-2 rounded-lg font-bold">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.price;

  const reviews = product?.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : '5.0';
  const displayReviewCountText = reviewCount > 0 ? `(${reviewCount} রিভিউ)` : '(০ রিভিউ)';

  const scrollReviews = (offset) => {
    if (reviewsSliderRef.current) {
      reviewsSliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      <style>{`
        body { font-family: 'Manrope', sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px rgba(45, 75, 62, 0.08); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .bg-brand-green { background-color: var(--brand-green); }
        .text-brand-green { color: var(--brand-green); }
        .border-brand-green { border-color: var(--brand-green); }
        .bg-brand-yellow { background-color: var(--brand-yellow); }
        .bg-soft-yellow { background-color: #fdf8e6; }
        .bg-soft-red { background-color: #fff1f1; }
        .hero-banner-bg { background: var(--theme-gradient, #fefce8); }
        .order-section-bg { background-color: var(--brand-green-hover); }
        .description-html-container,
        .description-html-container * {
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
      `}</style>

      {/* Reusable Header */}
      <Header />

      {/* Main Section */}
      <main className="pt-5 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-2 text-on-surface-variant text-sm">
          <Link className="hover:text-primary" to="/">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link className="hover:text-primary" to="/">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary font-semibold">Mustard Oil</span>
        </nav>

        {/* Product Gallery & Core Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-24">
          {/* Left: Product Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl overflow-hidden p-4 md:p-8 flex items-center justify-center">
              <img 
                alt={product.name} 
                className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-sm" 
                src={getSelectedVariantImage()} 
              />
            </div>
            <div className="flex flex-wrap gap-4">
              {product.image && (
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`w-24 h-24 glass-card rounded-lg overflow-hidden p-1 border-2 transition-all ${
                    !selectedVariant ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img alt={product.name} className="w-full h-full object-cover rounded-md" src={product.image} />
                </button>
              )}
              {variants.map(v => {
                const isSelected = selectedVariant?.id === v.id;
                let img = v.image;
                if (!img) {
                  const idx = getVariantIndex(v.name);
                  if (idx === 0) img = '/assets/img/500ml.png';
                  else if (idx === 2) img = '/assets/img/5l.png';
                  else img = '/assets/img/1l.png';
                }
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-24 h-24 glass-card rounded-lg overflow-hidden p-1 border-2 transition-all ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img alt={v.name} className="w-full h-full object-cover rounded-md" src={img} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <h1 className="font-bold text-3xl md:text-5xl text-brand-green mb-4 leading-tight">
              {product.name || '১০০% খাঁটি ঘানিতে ভাঙানো সরিষার তেল'}
            </h1>
            {product.short_description ? (
              <p className="text-on-surface-variant mb-6 leading-relaxed font-body-md">
                {product.short_description}
              </p>
            ) : (
              <p className="text-on-surface-variant mb-6 leading-relaxed font-body-md">
                বিশুদ্ধ ও খাঁটি প্রাকৃতিক সরিষার তেল আপনার পরিবারের সুস্থতার জন্য সেরা পছন্দ।
              </p>
            )}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-secondary">৳{currentPrice}</span>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{avgRating}</span>
                <span className="text-sm">{displayReviewCountText}</span>
              </div>
            </div>

            {/* USP Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#2d4b3e]" /> Cold Pressed
              </span>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Shield className="w-4 h-4 text-[#2d4b3e]" /> Chemical Free
              </span>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Sprout className="w-4 h-4 text-[#2d4b3e]" /> Natural &amp; Healthy
              </span>
            </div>

            {/* Quantity Selector */}
            {variants.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-on-surface-variant mb-3 uppercase tracking-wider">পরিমাণ (Quantity)</label>
                <div className="flex flex-wrap gap-4">
                  {variants.map(v => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`border-2 px-6 py-2 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'border-primary text-primary glass-card bg-green-50/50'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-primary text-primary py-4 rounded-xl font-bold text-lg glass-card hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                Buy Now
              </button>
            </div>

            {/* Quick Trust Signals */}
            <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <Truck className="w-6 h-6 text-[#2d4b3e]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Free Shipping</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">On orders above ৳১০০০</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <CreditCard className="w-6 h-6 text-[#2d4b3e]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Cash on Delivery</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Available nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="mb-24">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <h2 className="font-headline-lg text-primary mb-8">পণ্য বিস্তারিত (Product Details)</h2>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  পণ্যের বর্ণনা
                </h3>
                <div 
                  className="text-on-surface-variant leading-relaxed font-medium description-html-container"
                  dangerouslySetInnerHTML={{ __html: product.description || 'আমাদের এই সরিষার তেল শত বছরের ঐতিহ্যবাহী কাঠের ঘানিতে কোনো তাপ ছাড়াই প্রস্তুত করা হয়। এতে তেলের প্রতিটি বিন্দুতে থাকে খাঁটি পুষ্টি এবং প্রাকৃতিক ঝাঁঝ, যা আপনার খাবারের স্বাদ বাড়িয়ে তুলবে বহু গুণ।' }}
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex justify-between py-3 border-b border-outline-variant/30">
                  <span className="font-bold">উপাদান</span>
                  <span className="text-on-surface-variant font-semibold">{product.ingredients || '১০০% দেশী সরিষা'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant/30">
                  <span className="font-bold">প্রস্তুত প্রণালী</span>
                  <span className="text-on-surface-variant font-semibold">{product.prep_method || 'কোল্ড প্রেসড (কাঠের ঘানি)'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant/30">
                  <span className="font-bold">সংরক্ষণকাল</span>
                  <span className="text-on-surface-variant font-semibold">{product.shelf_life || '১২ মাস'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant/30">
                  <span className="font-bold">উৎস</span>
                  <span className="text-on-surface-variant font-semibold">{product.source || 'রাজশাহী, বাংলাদেশ'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Benefits & Process */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-24">
          {/* Purity Process */}
          <div className="md:col-span-2 glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-headline-lg text-primary mb-6">আমাদের ঐতিহ্যবাহী ঘানি পদ্ধতি</h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed max-w-2xl font-medium">
                আমরা কোনো কৃত্রিম যন্ত্র বা তাপ ব্যবহার করি না। কাঠের ঘানিতে খুব ধীরগতিতে সরিষা পিষে তেল বের করা হয়, ফলে তেলের প্রাকৃতিক পুষ্টিগুণ, ঝাঁঝ এবং সুগন্ধ অক্ষুণ্ণ থাকে। এই পদ্ধতিটি শত বছরের পুরনো বাংলার ঐতিহ্য যা স্বাস্থ্যের জন্য সেরা।
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-secondary font-bold">
                  <CheckCircle2 className="w-4 h-4" /> কোনো রিফাইনিং নেই
                </li>
                <li className="flex items-center gap-3 text-secondary font-bold">
                  <CheckCircle2 className="w-4 h-4" /> প্রাকৃতিক ঝাঁঝ সংরক্ষিত
                </li>
                <li className="flex items-center gap-3 text-secondary font-bold">
                  <CheckCircle2 className="w-4 h-4" /> ১০০% অ্যান্টি-অক্সিডেন্ট সমৃদ্ধ
                </li>
              </ul>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Sprout className="w-[300px] h-[300px] text-brand-green" />
            </div>
          </div>
          {/* Health Benefits Column */}
          <div className="bg-primary text-on-primary rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-headline-lg mb-6">স্বাস্থ্য উপকারিতা</h3>
              <ul className="space-y-6">
                {webContent.product_advantage.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    {item.icon === 'Heart' && <Heart className="w-6 h-6 text-primary-fixed" />}
                    {item.icon === 'Smile' && <Smile className="w-6 h-6 text-primary-fixed" />}
                    {item.icon === 'Utensils' && <Utensils className="w-6 h-6 text-primary-fixed" />}
                    {!['Heart', 'Smile', 'Utensils'].includes(item.icon) && <span className="text-xl">{item.icon}</span>}
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm opacity-80 font-medium">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-8 text-sm font-bold flex items-center gap-2 group">
              আরও জানুন <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        {/* Usage & Care Section */}
        <section className="mb-24">
          <h2 className="font-headline-lg text-primary text-center mb-12">ব্যবহার নির্দেশিকা</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {webContent.usage_tip.map((item) => (
              <div key={item.id} className="glass-card p-8 rounded-2xl flex gap-6 items-start">
                <div className="bg-secondary/10 p-4 rounded-xl text-secondary flex items-center justify-center">
                  {item.icon === 'Flame' && <Flame className="w-8 h-8 text-[#2d4b3e]" />}
                  {item.icon === 'Sparkles' && <Sparkles className="w-8 h-8 text-[#2d4b3e]" />}
                  {!['Flame', 'Sparkles'].includes(item.icon) && <span className="text-2xl">{item.icon}</span>}
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-on-surface-variant font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-primary font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>গ্রাহকদের কথা (Customer Reviews)</h2>
              <p className="text-on-surface-variant mt-2 font-medium">আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollReviews(-300)} className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => scrollReviews(300)} className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div ref={reviewsSliderRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth testimonial-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="glass-card p-6 rounded-2xl min-w-[280px] md:w-[calc(33.333%-1rem)] flex-shrink-0 snap-center flex flex-col justify-between text-left">
                  <div>
                    <div className="flex gap-1 text-yellow-500 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-on-surface italic mb-6 font-medium">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-xs text-secondary font-bold uppercase">
                      {rev.customer_name ? rev.customer_name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{rev.customer_name}</p>
                      <p className="text-[10px] text-on-surface-variant font-semibold">ভেরিফাইড পারচেজ</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-gray-500 font-medium bg-white rounded-xl border border-gray-100 shadow-sm font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-50 text-gray-400" />
                এই পণ্যটির জন্য এখনো কোনো রিভিউ দেওয়া হয়নি।
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}
