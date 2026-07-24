import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../utils/api';
import { trackEvent } from '../utils/tracker';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SingleProductLanding() {
  const navigate = useNavigate();
  const toast = useToast();
  const sliderRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678',
    delivery_charge_dhaka: '60',
    delivery_charge_outside: '120',
    hero_mode: 'slider'
  });

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [approvedReviews, setApprovedReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    phone: '',
    rating: 5,
    product_id: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [webContent, setWebContent] = useState({
    about_main: { title: 'সমাধান: আমাদের ঘানির খাঁটি সরিষার তেল', description: 'আমাদের তেল তৈরি হয় গ্রামে ঐতিহ্যবাহী ঘানিতে ধীরে ধীরে ভাঙানোর মাধ্যমে। কোনো ধরনের কেমিক্যাল বা মেশিন প্রসেস ছাড়াই প্রাকৃতিক উপায়ে তৈরি করা হয়। ফলে তেলের আসল গন্ধ, স্বাদ ও পুষ্টি অক্ষুণ্ণ থাকে।' },
    about_feature: [],
    why_choose_reason: [],
    self_branding_point: [],
    our_process_step: [],
    product_advantage: [],
    usage_tip: []
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [settingsRes, bannersRes, reviewsRes, productsRes, contentRes] = await Promise.all([
          axios.get(`${API_URL}/api/settings`),
          axios.get(`${API_URL}/api/banners`),
          axios.get(`${API_URL}/api/reviews/approved`),
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/website-content`)
        ]);

        const loadedSettings = settingsRes.data || {};
        setSettings(prev => ({ ...prev, ...loadedSettings }));
        setBanners(bannersRes.data || []);
        setApprovedReviews(reviewsRes.data || []);
        if (contentRes.data) {
          setWebContent(prev => ({ ...prev, ...contentRes.data }));
        }

        const loadedProducts = productsRes.data || [];
        setProducts(loadedProducts);

        if (loadedProducts.length > 0) {
          let activeProduct = loadedProducts[0];
          const singleProductId = loadedSettings.single_product_id;
          if (singleProductId) {
            const found = loadedProducts.find(p => p.id === parseInt(singleProductId));
            if (found) {
              activeProduct = found;
            }
          }

          setReviewForm(prev => ({ ...prev, product_id: activeProduct.id }));

          // Fetch product details with variants
          const detailRes = await axios.get(`${API_URL}/api/products/${activeProduct.id}`);
          setProduct(detailRes.data);
          setVariants(detailRes.data.variants || []);
          if (detailRes.data.variants && detailRes.data.variants.length > 0) {
            setSelectedVariant(detailRes.data.variants[0]);
          }

          trackEvent('ViewContent', {
            content_name: detailRes.data.name,
            content_ids: [detailRes.data.id],
            value: detailRes.data.price,
            currency: 'BDT'
          });
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

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
      const parsed = JSON.parse(savedUser);
      setCustomerUser(parsed);
      setForm(prev => ({
        ...prev,
        name: prev.name || parsed.name || '',
        phone: prev.phone || parsed.phone || ''
      }));
      setReviewForm(prev => ({
        ...prev,
        customer_name: prev.customer_name || parsed.name || '',
        phone: prev.phone || parsed.phone || ''
      }));

      // Fetch default address
      axios.get(`${API_URL}/api/customer/addresses/${parsed.phone}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            const def = res.data.find(a => a.is_default) || res.data[0];
            setForm(prev => ({ ...prev, address: prev.address || def.address || '' }));
          }
        })
        .catch(console.error);
    }

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

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

  const handleProductChange = async (e) => {
    const productId = parseInt(e.target.value);
    const selected = products.find(p => p.id === productId);
    if (selected) {
      setLoading(true);
      try {
        const detailRes = await axios.get(`${API_URL}/api/products/${selected.id}`);
        setProduct(detailRes.data);
        setVariants(detailRes.data.variants || []);
        if (detailRes.data.variants && detailRes.data.variants.length > 0) {
          setSelectedVariant(detailRes.data.variants[0]);
        } else {
          setSelectedVariant(null);
        }
      } catch (err) {
        console.error("Error loading product variants:", err);
        toast.error('পণ্য ভেরিয়েন্ট লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVariantChange = (e) => {
    const variantId = parseInt(e.target.value);
    const variant = variants.find(v => v.id === variantId);
    setSelectedVariant(variant);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormFocus = () => {
    trackEvent('InitiateCheckout', {
      content_name: product?.name || 'Mustard Oil',
      value: selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : (product?.price || 0),
      currency: 'BDT'
    });
  };

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    const orderSection = document.getElementById('order');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollTestimonials = (offset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customer_name || !reviewForm.rating || !reviewForm.comment || !reviewForm.product_id) {
      toast.error('দয়া করে সবগুলি ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await axios.post(`${API_URL}/api/reviews`, reviewForm);
      if (res.data.success) {
        toast.success('আপনার রিভিউটি সফলভাবে সাবমিট হয়েছে এবং মডারেশনের জন্য পাঠানো হয়েছে!');
        setReviewForm({
          customer_name: customerUser?.name || '',
          phone: customerUser?.phone || '',
          rating: 5,
          product_id: products[0]?.id || '',
          comment: ''
        });
      }
    } catch (err) {
      toast.error('রিভিউ সাবমিট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % banners.length);
  };

  // Auto-slide effect for hero slider
  useEffect(() => {
    if (settings.hero_mode === 'slider' && banners.length > 1) {
      const interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [settings.hero_mode, banners.length]);

  const renderBannerContent = (banner) => {
    const bannerImg = banner.image || '/assets/img/hero.png';
    const bannerTitle = banner.title || 'সরিষার তেল';
    const bannerSubtitle = banner.subtitle || '১০০% খাঁটি ঘানিতে ভাঙানো';
    const bannerDesc = banner.description || product?.description || 'ভেজালমুক্ত, প্রাকৃতিক ও স্বাস্থ্যকর তেল আপনার পরিবারের সুস্থতার জন্য সেরা পছন্দ।';
    const btnText = banner.button_text || 'এখনই অর্ডার করুন';
    let btnLink = banner.button_link || '#order';
    if (banner.product_id) {
      btnLink = `/product/${banner.product_id}`;
    }

    return (
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full animate-fade-in">
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <img alt={bannerTitle} className="w-full max-w-sm object-contain rounded-xl shadow-md" src={bannerImg} />
            <div className="absolute top-0 right-0 bg-brand-green text-white p-4 rounded-full text-center flex flex-col justify-center items-center h-24 w-24 shadow-lg animate-pulse">
              <span className="text-xs">১০০%</span>
              <span className="text-lg font-bold leading-tight">খাঁটি</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1">{bannerSubtitle}</h2>
          <h1 className="text-4xl md:text-7xl font-extrabold text-brand-green mb-4">{bannerTitle}</h1>
          <p className="text-base md:text-xl text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">{bannerDesc}</p>
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-10">
            <div className="text-center">
              <div className="bg-white p-3 rounded-full mb-2 inline-block shadow-sm">
                <img alt="Cold Pressed" className="w-6 h-6 md:w-8 md:h-8" src="/assets/img/cold_press.webp" />
              </div>
              <p className="font-bold text-[10px] md:text-sm">কোল্ড প্রেসড</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded-full mb-2 inline-block shadow-sm">
                <img alt="Chemical Free" className="w-6 h-6 md:w-8 md:h-8" src="/assets/img/chemical_free.png" />
              </div>
              <p className="font-bold text-[10px] md:text-sm">কেমিক্যাল মুক্ত</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded-full mb-2 inline-block shadow-sm">
                <img alt="Healthy" className="w-6 h-6 md:w-8 md:h-8" src="/assets/img/natural.png" />
              </div>
              <p className="font-bold text-[10px] md:text-sm">প্রাকৃতিক ও স্বাস্থ্যকর</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-4">
            {btnLink.startsWith('/') || btnLink.startsWith('http') ? (
              <a
                href={btnLink}
                className="bg-brand-green hover:opacity-90 text-white text-lg md:text-xl font-bold py-3 md:py-4 px-10 rounded-lg flex items-center gap-3 transition shadow-lg"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {btnText}
              </a>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const orderSec = document.getElementById(btnLink.substring(1) || 'order');
                  if (orderSec) orderSec.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-brand-green hover:opacity-90 text-white text-lg md:text-xl font-bold py-3 md:py-4 px-10 rounded-lg flex items-center gap-3 transition shadow-lg"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {btnText}
              </button>
            )}
            <p className="text-sm text-gray-600 font-medium">সারা দেশে হোম ডেলিভারি | ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>
      </div>
    );
  };

  const renderHeroSection = () => {
    if (settings.hero_mode === 'slider' && banners.length > 0) {
      return (
        <section className="hero-banner-bg py-10 md:py-20 relative overflow-hidden group">
          <div className="container mx-auto px-4">
            <div className="relative min-h-[480px] flex items-center">
              {banners.map((banner, index) => {
                const isActive = activeSlide === index;
                return (
                  <div
                    key={banner.id}
                    className={`w-full transition-all duration-1000 ease-in-out absolute inset-0 flex items-center ${
                      isActive ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none z-0'
                    }`}
                  >
                    {isActive && renderBannerContent(banner)}
                  </div>
                );
              })}
            </div>
            
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeSlide === index ? 'bg-brand-green w-6' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {banners.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white p-2.5 rounded-full shadow-md text-brand-green opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white p-2.5 rounded-full shadow-md text-brand-green opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </section>
      );
    }

    const displayBanner = banners.length > 0 ? banners[0] : {
      image: '/assets/img/hero.png',
      title: 'সরিষার তেল',
      subtitle: '১০০% খাঁটি ঘানিতে ভাঙানো',
      description: product?.description || 'ভেজালমুক্ত, প্রাকৃতিক ও স্বাস্থ্যকর তেল আপনার পরিবারের সুস্থতার জন্য সেরা পছন্দ।',
      button_text: 'এখনই অর্ডার করুন',
      button_link: '#order'
    };

    return (
      <section className="hero-banner-bg py-10 md:py-20">
        <div className="container mx-auto px-4">
          {renderBannerContent(displayBanner)}
        </div>
      </section>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEmailOtp = settings.otp_enabled !== false && settings.otp_type === 'email';
    
    if (!form.name || !form.phone || !form.address || (isEmailOtp && !form.email)) {
      toast.error('দয়া করে সবগুলি ফিল্ড সঠিকভাবে পূরণ করুন।');
      setOrderError('দয়া করে সবগুলি ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (!product) {
      toast.error('কোন পণ্য পাওয়া যায়নি।');
      setOrderError('কোন পণ্য পাওয়া যায়নি।');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    const unitPrice = selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.price;
    const totalAmount = unitPrice;

    // Check if OTP is disabled
    if (settings.otp_enabled === false) {
      try {
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return '';
        };

        const orderPayload = {
          customer_name: form.name,
          phone: form.phone,
          email: form.email || null,
          address: form.address,
          total_amount: totalAmount,
          fbclid: localStorage.getItem('ghani_fbclid') || '',
          utm_source: localStorage.getItem('ghani_utm_source') || '',
          utm_medium: localStorage.getItem('ghani_utm_medium') || '',
          utm_campaign: localStorage.getItem('ghani_utm_campaign') || '',
          fbp: getCookie('_fbp') || '',
          items: [{
            product_id: product.id,
            quantity: 1,
            price: unitPrice,
            variant_id: selectedVariant ? selectedVariant.id : null
          }]
        };

        const res = await axios.post(`${API_URL}/api/orders/no-otp`, orderPayload);
        
        if (res.data.success) {
          trackEvent('Lead', {
            value: totalAmount,
            currency: 'BDT',
            content_name: product.name,
            content_ids: [product.id]
          }, {
            phone: form.phone,
            email: form.email || ''
          });

          if (res.data.user) {
            localStorage.setItem('customer_user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('customer-user-updated'));
          }

          toast.success('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
          setForm({ name: '', phone: '', address: '', email: '' });

          navigate('/thank-you', {
            state: {
              orderId: res.data.order_id,
              customerName: form.name,
              phone: form.phone,
              address: form.address,
              total: totalAmount,
              productName: product.name,
              variantName: selectedVariant ? selectedVariant.name : ''
            }
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'অর্ডার করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // OTP Flow
    try {
      const res = await axios.post(`${API_URL}/api/orders/send-otp`, { 
        phone: form.phone,
        email: form.email || null
      });
      if (res.data.success) {
        setDevOtp(res.data.devOtp || '');
        setShowOtpModal(true);
        if (isEmailOtp) {
          toast.success('আপনার ইমেইলে একটি ওটিপি (OTP) পাঠানো হয়েছে!');
        } else {
          toast.success('আপনার মোবাইলে একটি ওটিপি (OTP) পাঠানো হয়েছে!');
        }
      } else {
        toast.error('ওটিপি পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      toast.error('ওটিপি পাঠাতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      toast.warning('দয়া করে ওটিপি কোডটি লিখুন।');
      return;
    }

    setVerifyingOtp(true);
    const unitPrice = selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.price;
    const totalAmount = unitPrice;

    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
      };

      const orderPayload = {
        customer_name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address,
        total_amount: totalAmount,
        otp: otpCode,
        fbclid: localStorage.getItem('ghani_fbclid') || '',
        utm_source: localStorage.getItem('ghani_utm_source') || '',
        utm_medium: localStorage.getItem('ghani_utm_medium') || '',
        utm_campaign: localStorage.getItem('ghani_utm_campaign') || '',
        fbp: getCookie('_fbp') || '',
        items: [{
          product_id: product.id,
          quantity: 1,
          price: unitPrice,
          variant_id: selectedVariant ? selectedVariant.id : null
        }]
      };

      const res = await axios.post(`${API_URL}/api/orders/verify-otp`, orderPayload);
      
      if (res.data.success) {
        trackEvent('Lead', {
          value: totalAmount,
          currency: 'BDT',
          content_name: product.name,
          content_ids: [product.id]
        }, {
          phone: form.phone,
          email: form.email || ''
        });

        if (res.data.user) {
          localStorage.setItem('customer_user', JSON.stringify(res.data.user));
          window.dispatchEvent(new Event('customer-user-updated'));
        }

        toast.success('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
        setShowOtpModal(false);
        setForm({ name: '', phone: '', address: '', email: '' });

        navigate('/thank-you', {
          state: {
            orderId: res.data.order_id,
            customerName: form.name,
            phone: form.phone,
            address: form.address,
            total: totalAmount,
            productName: product.name,
            variantName: selectedVariant ? selectedVariant.name : ''
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-green font-bold">
        অপেক্ষা করুন...
      </div>
    );
  }

  // Get image and default pricing info for a variant name to match template cards
  const getVariantDisplayMeta = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('500') || lower.includes('৫০০')) {
      return {
        img: '/assets/img/500ml.png',
        originalPrice: '৳২০০',
        label: '500ml বোতল'
      };
    } else if (lower.includes('5') || lower.includes('৫')) {
      return {
        img: '/assets/img/5l.png',
        originalPrice: '৳১৬৫০',
        label: '5 লিটার প্যাক'
      };
    } else {
      return {
        img: '/assets/img/1l.png',
        originalPrice: '৳৩৬০',
        label: '1 লিটার বোতল'
      };
    }
  };

  const isMultiMode = settings.store_mode?.toLowerCase() === 'multi' || settings.store_mode === 'Multi Product';
  const latest8Products = [...products]
    .filter(p => p.variant_count === 1) // Issue 8 requirement
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  return (
    <div className="bg-gray-50 text-gray-800 font-sans" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
      {/* CSS Configurations */}
      <style>{`
        .bg-brand-green { background-color: var(--brand-green); }
        .text-brand-green { color: var(--brand-green); }
        .border-brand-green { border-color: var(--brand-green); }
        .bg-brand-yellow { background-color: var(--brand-yellow); }
        .bg-soft-yellow { background-color: #fdf8e6; }
        .bg-soft-red { background-color: #fff1f1; }
        .hero-banner-bg { background: var(--theme-gradient, #fefce8); }
        .order-section-bg { background-color: var(--brand-green-hover); }
        .testimonial-container { scroll-behavior: smooth; scrollbar-width: none; }
        .testimonial-container::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Reusable Header */}
      <Header />

      <main>
        {/* Hero Section */}
        {renderHeroSection()}

        {/* Problem Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-1">আপনি কি নিশ্চিত আপনার তেলটা আসল?</h3>
            <div className="w-16 h-1 bg-brand-green mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {webContent.self_branding_point.map((item) => (
                <div key={item.id} className="bg-soft-red p-8 rounded-2xl border border-red-100">
                  <div className="text-red-500 mb-4 text-5xl">{item.icon}</div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 bg-soft-yellow" id="why-choose">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h3 className="text-3xl md:text-4xl font-bold text-brand-green mb-6 leading-tight">
                {webContent.about_main.title}
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                {webContent.about_main.description}
              </p>
              <ul className="space-y-4">
                {webContent.about_feature.map((feat) => (
                  <li key={feat.id} className="flex items-start gap-3">
                    <span className="text-brand-green bg-green-100 rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-gray-800">{feat.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img alt="Traditional Pressing" className="rounded-2xl shadow-xl w-4/5" src={webContent.about_main.image || '/assets/img/oil.png'} />
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-16 bg-white" id="why-oil">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-1">এই তেল কেন খাবেন?</h3>
            <div className="w-16 h-1 bg-brand-green mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {webContent.why_choose_reason.map((item) => (
                <div key={item.id} className="p-6 rounded-xl border border-yellow-100 bg-soft-yellow">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-1">আমাদের তেলের যাত্রা</h3>
            <div className="w-16 h-1 bg-brand-green mx-auto mb-12"></div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-7 items-center justify-center">
              {webContent.our_process_step.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div>
                    <img alt={step.title} className="rounded-lg mb-4 w-full h-40 object-cover shadow" src={step.image} />
                    <p className="text-brand-green font-bold">{step.title}</p>
                  </div>
                  {idx < webContent.our_process_step.length - 1 && (
                    <div className="hidden md:flex items-center justify-center">
                      <span className="material-symbols-outlined text-brand-green text-3xl">arrow_forward</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section (Dynamically uses database variants to build 3 cards matching template exactly) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-1">আমাদের পণ্য সমূহ</h3>
            <div className="w-16 h-1 bg-brand-green mx-auto mb-12"></div>
            {isMultiMode ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  {latest8Products.map((p, index) => {
                    const avgRating = p.rating_avg || '5.0';
                    const ratingCount = p.rating_count || 0;
                    return (
                      <div key={p.id} className="border rounded-2xl p-6 flex flex-col justify-between bg-white shadow-sm hover:shadow-lg hover:border-brand-green transition-all duration-200 text-left">
                        <div>
                          <div className="h-56 w-full bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 border border-gray-100">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-full object-contain" />
                            ) : (
                              <span className="text-gray-400 text-sm">পণ্য চিত্র নেই</span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[56px] mb-2 leading-snug">{p.name}</h4>
                          <div className="flex items-center gap-1 mb-4 text-yellow-500 justify-start">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-400 font-semibold ml-1">({ratingCount})</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-4 border-t pt-4 border-gray-100">
                            <span className="text-gray-500 text-xs">মূল্য:</span>
                            <span className="text-brand-green font-extrabold text-xl">৳{p.price}</span>
                          </div>
                          <Link to={`/product/${p.slug || p.id}`} className="w-full bg-brand-green text-white py-3 rounded-lg font-bold text-center block hover:opacity-90 transition text-sm">
                            পণ্য দেখুন
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-10">
                  <Link to="/products" className="bg-brand-green hover:opacity-90 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition shadow-md">
                    <span>সকল পণ্য দেখুন</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {variants.map((v, index) => {
                  const meta = getVariantDisplayMeta(v.name);
                  const isFeatured = index === 1 || v.name.includes('1') || v.name.includes('১');
                  return (
                    <div key={v.id} className={`border rounded-2xl p-6 flex flex-col items-center bg-white transition ${isFeatured ? 'border-2 border-brand-green shadow-xl scale-105 relative transform' : 'shadow-sm hover:shadow-md'}`}>
                      {isFeatured && (
                        <div className="absolute -top-4 bg-brand-green text-white px-6 py-1 rounded-full text-sm font-bold">সর্বাধিক জনপ্রিয়</div>
                      )}
                      <img alt={v.name} className="h-64 object-contain mb-4" src={meta.img} />
                      <h4 className="text-xl font-bold mb-2">{meta.label}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-gray-800">৳{v.offer_price || v.price}</span>
                        <span className="text-gray-400 line-through text-sm">{meta.originalPrice}</span>
                      </div>
                      <ul className="text-left space-y-2 mb-6 w-full text-sm">
                        <li className="flex items-center gap-2">✅ খাঁটি ও কেমিক্যাল মুক্ত</li>
                        <li className="flex items-center gap-2">✅ ঘানি পদ্ধতিতে ভাঙানো</li>
                        <li className="flex items-center gap-2">✅ সারা দেশে ডেলিভারি</li>
                      </ul>
                      <button
                        onClick={() => handleSelectVariant(v)}
                        className="w-full bg-brand-green text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition hover:opacity-95"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        অর্ডার করুন
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials (Accurate list & functional slider) */}
        <section className="py-16 bg-soft-yellow overflow-hidden" id="testimonials">
          <div className="container mx-auto px-4 text-center relative">
            <h3 className="text-3xl font-bold mb-1">গ্রাহকদের মতামত</h3>
            <div className="w-16 h-1 bg-brand-green mx-auto mb-12"></div>
            <div className="relative max-w-6xl mx-auto px-12">
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition"
                onClick={() => handleScrollTestimonials(-400)}>
                <svg className="w-6 h-6 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                </svg>
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition"
                onClick={() => handleScrollTestimonials(400)}>
                <svg className="w-6 h-6 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                </svg>
              </button>
              <div
                ref={sliderRef}
                className="testimonial-container flex gap-6 overflow-x-hidden pb-4 snap-x snap-mandatory scroll-smooth"
                id="testimonial-slider"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {approvedReviews.length > 0 ? (
                  approvedReviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-6 rounded-xl shadow-sm min-w-[280px] flex-shrink-0 snap-center border border-gray-100 flex flex-col md:w-[calc(33.333%-1rem)] text-left">
                      <div className="text-yellow-400 mb-4 text-sm flex justify-start">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                      <p className="text-gray-600 mb-6 italic text-sm leading-relaxed text-left">
                        "{rev.comment}"
                      </p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green font-bold text-lg flex items-center justify-center">
                          {rev.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-800">{rev.customer_name}</p>
                          {rev.product_name && <p className="text-xs text-brand-green font-semibold">{rev.product_name}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-xl shadow-sm min-w-[280px] flex-shrink-0 snap-center border border-gray-100 flex flex-col md:w-[calc(33.333%-1rem)]">
                      <div className="text-yellow-400 mb-4 text-sm flex justify-center md:justify-start">★★★★★</div>
                      <p className="text-gray-600 mb-6 italic text-sm leading-relaxed text-center md:text-left">"তেলের গন্ধ একদম প্রাণের মতো। এতদিন যা খেয়েছি সব ভেজাল ছিল বুঝতে পারছি। এখন থেকে শুধু আপনাদের তেলই খাবো।"</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <img alt="Avatar" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu5MJNBNJlCWC-9enQewtusWh0IvWUWJmPvgmLmtv8T8JDhFCpnlxMF3JauPNSn1hJjmpRPc2a7fYDVQovjVsGJVRg2uFd74Ao6aiCeww4G7d9rOTXUq3BqvlwujXGjCbcwNigAcoOis2cUdwzgLhZF5vTwRDcYyC8G9WFWuewo6alsW8LD3lYl2iDoLqCsoEQCBRVEe_QwXUT1I8PCmEYpK4xejHXe9KW_r2UF_LHI0hfZ3NrcBRU-gVhfkLgP9REWNcMM-9A4vU7" style={{ objectPosition: '0% 0%' }} />
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-800">রোকসানা বেগম</p>
                          <p className="text-xs text-gray-400">ঢাকা</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm min-w-[280px] flex-shrink-0 snap-center border border-gray-100 flex flex-col md:w-[calc(33.333%-1rem)]">
                      <div className="text-yellow-400 mb-4 text-sm flex justify-center md:justify-start">★★★★★</div>
                      <p className="text-gray-600 mb-6 italic text-sm leading-relaxed text-center md:text-left">"খুবই ভালো মানের তেল। রান্নায় স্বাদও অসাধারণ। ডেলিভারিও দ্রুত পেয়েছি। ধন্যবাদ খাঁটি তেল পরিবারকে।"</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <img alt="Avatar" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu5MJNBNJlCWC-9enQewtusWh0IvWUWJmPvgmLmtv8T8JDhFCpnlxMF3JauPNSn1hJjmpRPc2a7fYDVQovjVsGJVRg2uFd74Ao6aiCeww4G7d9rOTXUq3BqvlwujXGjCbcwNigAcoOis2cUdwzgLhZF5vTwRDcYyC8G9WFWuewo6alsW8LD3lYl2iDoLqCsoEQCBRVEe_QwXUT1I8PCmEYpK4xejHXe9KW_r2UF_LHI0hfZ3NrcBRU-gVhfkLgP9REWNcMM-9A4vU7" style={{ objectPosition: '50% 0%' }} />
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-800">আরিফ হোসেন</p>
                          <p className="text-xs text-gray-400">চট্টগ্রাম</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm min-w-[280px] flex-shrink-0 snap-center border border-gray-100 flex flex-col md:w-[calc(33.333%-1rem)]">
                      <div className="text-yellow-400 mb-4 text-sm flex justify-center md:justify-start">★★★★★</div>
                      <p className="text-gray-600 mb-6 italic text-sm leading-relaxed text-center md:text-left">"আমার বাচ্চার জন্য নিরাপদ তেল খুঁজছিলাম। এখানে পেয়ে খুব খুশি। ১০০% রিকমেন্ডেড।"</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <img alt="Avatar" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu5MJNBNJlCWC-9enQewtusWh0IvWUWJmPvgmLmtv8T8JDhFCpnlxMF3JauPNSn1hJjmpRPc2a7fYDVQovjVsGJVRg2uFd74Ao6aiCeww4G7d9rOTXUq3BqvlwujXGjCbcwNigAcoOis2cUdwzgLhZF5vTwRDcYyC8G9WFWuewo6alsW8LD3lYl2iDoLqCsoEQCBRVEe_QwXUT1I8PCmEYpK4xejHXe9KW_r2UF_LHI0hfZ3NrcBRU-gVhfkLgP9REWNcMM-9A4vU7" style={{ objectPosition: '100% 0%' }} />
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-800">নুসরাত জাহান</p>
                          <p className="text-xs text-gray-400">সিলেট</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Review Submission Card Form */}
            <div className="mt-16 max-w-lg mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/40 text-left" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <h4 className="text-2xl font-bold text-[#2d4b3e] mb-1 text-center">আপনার মূল্যবান মতামত দিন</h4>
              <p className="text-xs text-gray-600 text-center mb-6">আমাদের তেল ও সেবা সম্পর্কে আপনার রিভিউটি নিচের ফর্মে লিখুন।</p>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">আপনার নাম</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="আপনার নাম লিখুন" 
                      className="w-full text-sm rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-white p-2 border font-medium" 
                      value={reviewForm.customer_name} 
                      onChange={e => setReviewForm({ ...reviewForm, customer_name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      placeholder="01XXXXXXXXX" 
                      className="w-full text-sm rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-white p-2 border font-medium" 
                      value={reviewForm.phone} 
                      onChange={e => setReviewForm({ ...reviewForm, phone: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">পণ্যটি সিলেক্ট করুন</label>
                    <select 
                      required
                      className="w-full text-sm rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-white p-2 border font-medium"
                      value={reviewForm.product_id}
                      onChange={e => setReviewForm({ ...reviewForm, product_id: e.target.value })}
                    >
                      <option value="">পণ্য সিলেক্ট করুন</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">রেটিং</label>
                    <select 
                      required
                      className="w-full text-sm rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-white p-2 border font-semibold text-yellow-600"
                      value={reviewForm.rating}
                      onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    >
                      <option value={5}>★★★★★ (৫/৫)</option>
                      <option value={4}>★★★★☆ (৪/৫)</option>
                      <option value={3}>★★★☆☆ (৩/৫)</option>
                      <option value={2}>★★☆☆☆ (২/৫)</option>
                      <option value={1}>★☆☆☆☆ (১/৫)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">মতামত / মন্তব্য</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="আপনার মন্তব্যটি এখানে লিখুন..." 
                    className="w-full text-sm rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-white p-2 border font-medium" 
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview} 
                  className="w-full bg-[#f7b700] hover:bg-yellow-500 text-black font-extrabold py-3 rounded-lg text-base transition shadow-md disabled:opacity-50"
                >
                  {submittingReview ? 'পাঠানো হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Order Form Section (Includes template checkmarks/badges and proper images) */}
        <section id="order" className="order-section-bg pt-12 md:pt-16 text-white pb-24 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              <div className="md:w-4/12 text-center md:text-left">
                <h3 className="text-4xl font-bold mb-4">এখনই অর্ডার করুন</h3>
                <p className="text-lg opacity-90 mb-8">খাঁটি সরিষার তেল পেতে নিচের ফর্মটি পূরণ করুন</p>
                <div className="flex justify-between md:justify-start gap-4 md:gap-8 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 p-3 rounded-full mb-2 flex items-center justify-center w-12 h-12">
                      <img className="w-6 h-6" src="/assets/img/cod.png" alt="COD" />
                    </div>
                    <p className="text-[10px] md:text-xs text-center font-medium">ক্যাশ অন ডেলিভারি</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 p-3 rounded-full mb-2 flex items-center justify-center w-12 h-12">
                      <img className="w-6 h-6" src="/assets/img/return.png" alt="Return" />
                    </div>
                    <p className="text-[10px] md:text-xs text-center font-medium">৩ দিনের রিটার্ন গ্যারান্টি</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 p-3 rounded-full mb-2 flex items-center justify-center w-12 h-12">
                      <img className="w-6 h-6" src="/assets/img/organic.png" alt="Organic" />
                    </div>
                    <p className="text-[10px] md:text-xs text-center font-medium">শতভাগ অর্গানিক পণ্য</p>
                  </div>
                </div>
              </div>
              <div className="md:w-5/12 w-full">
                <div className="bg-white rounded-xl p-6 md:p-8 text-gray-800 shadow-2xl">
                  {orderError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">
                      {orderError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-1">আপনার নাম</label>
                        <input name="name" onFocus={handleFormFocus} required className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border" placeholder="আপনার নাম লিখুন" type="text" value={form.name} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">মোবাইল নম্বর</label>
                        <input name="phone" required className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border" placeholder="01XXXXXXXXX" type="text" value={form.phone} onChange={handleInputChange} />
                      </div>
                    </div>
                    {settings.otp_enabled !== false && settings.otp_type === 'email' && (
                      <div>
                        <label className="block text-sm font-bold mb-1">ইমেইল ঠিকানা (Email Address)</label>
                        <input name="email" required className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border" placeholder="example@gmail.com" type="email" value={form.email || ''} onChange={handleInputChange} />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold mb-1">ঠিকানা</label>
                      <textarea name="address" required className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border" placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন" rows="2" value={form.address} onChange={handleInputChange}></textarea>
                    </div>
                    {products.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold mb-1">পণ্য সিলেক্ট করুন</label>
                        <select
                          className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border font-semibold"
                          onChange={handleProductChange}
                          value={product?.id || ''}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {variants.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold mb-1">ভেরিয়েন্ট সিলেক্ট করুন</label>
                        <select
                          className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green bg-gray-50 p-2 border font-semibold"
                          onChange={handleVariantChange}
                          value={selectedVariant?.id || ''}
                        >
                          {variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} - ৳{v.offer_price || v.price}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button disabled={isSubmitting} className="w-full bg-brand-yellow hover:bg-yellow-500 text-black font-extrabold py-3 md:py-4 rounded-lg flex items-center justify-center gap-2 text-lg md:text-xl transition shadow-lg disabled:opacity-55" type="submit">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      {isSubmitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                    </button>
                  </form>
                </div>
              </div>
              <div className="hidden md:flex md:w-3/12 justify-center items-center">
                {selectedVariant ? (
                  <img alt={product?.name} className="max-h-[400px] w-auto object-contain drop-shadow-2xl" src={getVariantDisplayMeta(selectedVariant.name).img} />
                ) : product?.image ? (
                  <img alt={product.name} className="max-h-[400px] w-auto object-contain drop-shadow-2xl rounded-xl" src={product.image} />
                ) : (
                  <img alt="Mustard Oil Product" className="max-h-[400px] w-auto object-contain drop-shadow-2xl" src="/assets/img/hero.png" />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#1e332a]/90 backdrop-blur-md border-t border-white/10">
          <a className="bg-[#25D366] text-white py-3 px-4 flex items-center justify-center gap-2 font-bold w-full hover:bg-[#20bd5a] transition" href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}?text=Hi,%20I%20want%20to%20order`}>
            <img alt="WhatsApp" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKG3dXDy6Cm8yuF8mAHFs972ERJl_DbGVV-QDKBRkLVwJ1-lAdSaN6Q4wU6m6jxZUlhiWAgISzUVD0UZizoXZn34XiggeC-6a2jfqWnp5RQ4nLcXZjrPTvutW2jX-UC8G32D5qXXkLVcktxpG3V8yJ27TKjAhJ-UoQ_lF7KlIDRNgi3sWgjbLPzb7Gt8b-jGrvoTDm6vf8itaH7DwK7peL7MkO6-kZFsDp5OZ6ibrN6tI3MfHPRaB0rtrtF5K70VpwOuA23r0XcPwc" />
            হোয়াটসঅ্যাপে অর্ডার করতে ক্লিক করুন
          </a>
          <div className="bg-white py-2 px-4 flex flex-wrap justify-center gap-4 md:gap-12 text-[10px] md:text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5"><span className="text-brand-green text-base">🚚</span> সারা দেশে হোম ডেলিভারি</div>
            <div className="flex items-center gap-1.5"><span className="text-brand-green text-base">💵</span> ক্যাশ অন ডেলিভারি</div>
            <div className="flex items-center gap-1.5"><span className="text-brand-green text-base">🛡️</span> ৩ দিনের রিটার্ন গ্যারান্টি</div>
            <div className="flex items-center gap-1.5"><span className="text-brand-green text-base">✅</span> ১০০% খাঁটি পণ্যের গ্যারান্টি</div>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-green">{settings.otp_type === 'email' ? 'ইমেইল ভেরিফিকেশন' : 'মোবাইল নম্বর ভেরিফিকেশন'}</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {settings.otp_type === 'email' ? (
                <>আপনার <strong>{form.email}</strong> ইমেইলে একটি ওটিপি (OTP) পাঠানো হয়েছে। ওটিপি কোডটি নিচের বক্সে লিখুন।</>
              ) : (
                <>আপনার <strong>{form.phone}</strong> নম্বরে একটি ওটিপি (OTP) পাঠানো হয়েছে। ওটিপি কোডটি নিচের বক্সে লিখুন।</>
              )}
            </p>

            {devOtp && (
              <div className="bg-green-50 text-green-800 text-xs font-bold p-3 rounded-lg mb-6 border border-green-200">
                🔧 Dev Mode Helper OTP: <span className="underline text-sm">{devOtp}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-gray-500">ভেরিফিকেশন কোড (OTP)</label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-green bg-gray-50"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full bg-[#f7b700] hover:bg-yellow-500 text-black font-extrabold py-3.5 rounded-xl transition duration-200 disabled:opacity-50 text-base"
              >
                {verifyingOtp ? 'ভেরিফাই হচ্ছে...' : 'ওটিপি নিশ্চিত করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
