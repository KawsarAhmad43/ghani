import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { trackEvent } from '../utils/tracker';
import API_URL from '../utils/api';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678',
    delivery_inside_dhaka: '60',
    delivery_outside_dhaka: '120',
    site_title: 'Ghani',
    site_logo: '',
    store_mode: 'single'
  });
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    delivery_zone: 'inside', // 'inside' or 'outside'
    payment: 'cod' // 'cod' or 'online'
  });

  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fraudCheckResult, setFraudCheckResult] = useState(null);
  const [checkingRisk, setCheckingRisk] = useState(false);
  const [advancePaymentInfo, setAdvancePaymentInfo] = useState({
    advance_payment_method: 'bkash',
    advance_transaction_id: ''
  });
  const [userAddresses, setUserAddresses] = useState([]);
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleRemoveFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, idx) => idx !== indexToRemove);
    setCart(updatedCart);
    localStorage.setItem('ghani_cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('পণ্যটি কার্ট থেকে সরানো হয়েছে!');
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

  useEffect(() => {
    const savedUser = localStorage.getItem('customer_user');
    const uData = savedUser ? JSON.parse(savedUser) : {};
    trackEvent('InitiateCheckout', {}, { phone: uData.phone || '', email: uData.email || '' });

    // Load Settings
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        setSettings(prev => ({ ...prev, ...res.data }));

        // Default advance payment method if the current one is not active
        if (res.data.advance_payment_methods) {
          const methods = res.data.advance_payment_methods.split(',');
          if (methods.length > 0 && !methods.includes(advancePaymentInfo.advance_payment_method)) {
            setAdvancePaymentInfo(prev => ({ ...prev, advance_payment_method: methods[0] }));
          }
        }

        // Check single product mode constraint
        const isSingle = res.data.store_mode?.toLowerCase() === 'single' || res.data.store_mode === 'Single Product';
        if (isSingle) {
          let savedCart = [];
          if (location.state && location.state.checkoutItem) {
            savedCart = [location.state.checkoutItem];
          } else {
            savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
          }
          if (savedCart.length > 0) {
            const firstItem = savedCart[0];
            const hasDifferent = savedCart.some(item => item.product_id !== firstItem.product_id || item.variant_id !== firstItem.variant_id);
            if (hasDifferent) {
              savedCart = [firstItem];
              localStorage.setItem('ghani_cart', JSON.stringify(savedCart));
              setCart(savedCart);
              toast.warning('your shop is single product variant store update it to Multi productstore to add more');
            }
          }
        }
      })
      .catch(console.error);

    // Load Cart from localStorage or router state
    if (location.state && location.state.checkoutItem) {
      setCart([location.state.checkoutItem]);
    } else {
      const savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
      setCart(savedCart);
    }
  }, [location.state]);

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
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || parsed.name || '',
        phone: prev.phone || parsed.phone || ''
      }));

      // Fetch addresses
      axios.get(`${API_URL}/api/customer/addresses/${parsed.phone}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setUserAddresses(res.data);
            const def = res.data.find(a => a.is_default) || res.data[0];
            setFormData(prev => ({ ...prev, address: prev.address || def.address || '' }));
          }
        })
        .catch(console.error);
    }

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  // Reverted automated phone risk check. Global advance payment setting is evaluated from the system config.


  useEffect(() => {
    if (formData.phone && formData.phone.length >= 11) {
      axios.get(`${API_URL}/api/profile/${formData.phone}`)
        .then(res => {
           setAvailablePoints(res.data.loyalty_points || 0);
        })
        .catch(() => {
           setAvailablePoints(0);
           setUsePoints(false);
        });
    } else {
      setAvailablePoints(0);
      setUsePoints(false);
    }
  }, [formData.phone]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return;
    setApplyingCoupon(true);
    try {
      const res = await axios.post(`${API_URL}/api/coupons/validate`, {
        code: couponCodeInput,
        cart_items: cart
      });
      let parsedEligible = [];
      try {
        parsedEligible = res.data.coupon.eligible_products ? (typeof res.data.coupon.eligible_products === 'string' ? JSON.parse(res.data.coupon.eligible_products) : res.data.coupon.eligible_products) : [];
      } catch(e) {}
      
      setAppliedCoupon({
        code: res.data.coupon.code,
        discount_percent: res.data.coupon.discount_percent,
        valid_for_all: res.data.coupon.valid_for_all,
        eligible_products: parsedEligible
      });
      toast.success('কুপন সফলভাবে যুক্ত হয়েছে!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'অবৈধ কুপন কোড');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasFreeDelivery = cart.some(item => item.offer_type === 'free_delivery');
  const deliveryCharge = hasFreeDelivery
    ? 0
    : (formData.delivery_zone === 'inside'
      ? Number(settings.delivery_inside_dhaka || 60)
      : Number(settings.delivery_outside_dhaka || 120));
      
  let couponDiscount = 0;
  if (appliedCoupon) {
      if (appliedCoupon.valid_for_all) {
          couponDiscount = Math.floor(cartTotal * (appliedCoupon.discount_percent / 100));
      } else {
          const eligibleTotal = cart.reduce((sum, item) => {
              return appliedCoupon.eligible_products.includes(item.id) 
                  ? sum + (item.price * item.quantity) 
                  : sum;
          }, 0);
          couponDiscount = Math.floor(eligibleTotal * (appliedCoupon.discount_percent / 100));
      }
  }
  
  let pointsDiscount = 0;
  let maxPointsUsable = parseInt(settings.loyalty_max_points_per_order) || 0;
  if (usePoints && availablePoints > 0) {
      pointsDiscount = availablePoints > maxPointsUsable && maxPointsUsable > 0 ? maxPointsUsable : availablePoints;
  }
  
  const grandTotal = Math.max(0, cartTotal + deliveryCharge - couponDiscount - pointsDiscount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.warning('আপনার কার্ট খালি আছে!');
      return;
    }

    const isEmailOtp = settings.otp_enabled !== false && settings.otp_type === 'email';
    if (!formData.customer_name || !formData.phone || !formData.address || (isEmailOtp && !formData.email)) {
      toast.error('দয়া করে সবগুলি ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (settings.fraud_check_enabled === 'true' && !advancePaymentInfo.advance_transaction_id) {
      toast.error('দয়া করে অগ্রিম পেমেন্টের ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setLoading(true);

    // Bypass OTP Flow
    if (settings.otp_enabled === false) {
      try {
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return '';
        };

        const orderData = {
          customer_name: formData.customer_name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address,
          total_amount: grandTotal,
          fbclid: localStorage.getItem('ghani_fbclid') || '',
          utm_source: localStorage.getItem('ghani_utm_source') || '',
          utm_medium: localStorage.getItem('ghani_utm_medium') || '',
          utm_campaign: localStorage.getItem('ghani_utm_campaign') || '',
          fbp: getCookie('_fbp') || '',
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            variant_id: item.variant_id || null
          })),
          advance_payment_method: settings.fraud_check_enabled === 'true' ? advancePaymentInfo.advance_payment_method : null,
          advance_transaction_id: settings.fraud_check_enabled === 'true' ? advancePaymentInfo.advance_transaction_id : null,
          buyer_success_rate: null,
          buyer_total_orders: null,
          buyer_failed_orders: null,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount_amount: couponDiscount,
          points_used: pointsDiscount
        };

        const res = await axios.post(`${API_URL}/api/orders/no-otp`, orderData);

        if (res.data.success) {
          trackEvent('Lead', {
            value: grandTotal,
            currency: 'BDT',
            order_id: res.data.order_id
          }, {
            phone: formData.phone,
            email: formData.email || ''
          });

          if (res.data.user) {
            localStorage.setItem('customer_user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('customer-user-updated'));
          }

          if (saveToAddressBook && res.data.user) {
            const exists = userAddresses.some(a => a.address === formData.address);
            if (!exists) {
              await axios.post(`${API_URL}/api/customer/addresses`, {
                user_phone: res.data.user.phone,
                label: 'Checkout Address',
                address: formData.address,
                is_default: true
              }).catch(console.error);
            }
          }

          localStorage.removeItem('ghani_cart');
          window.dispatchEvent(new Event('cart-updated'));

          toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
          setFormData({
            customer_name: '',
            phone: '',
            email: '',
            address: '',
            delivery_zone: 'inside',
            payment: 'cod'
          });

          navigate('/thank-you', {
            state: {
              orderId: res.data.order_id,
              customerName: formData.customer_name,
              phone: formData.phone,
              address: formData.address,
              total: grandTotal,
              productName: cart[0]?.name || 'সরিষার তেল',
              variantName: cart[0]?.variant_name || '',
              items: cart
            }
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'অর্ডার করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard OTP Flow
    try {
      const res = await axios.post(`${API_URL}/api/orders/send-otp`, { 
        phone: formData.phone,
        email: formData.email || null
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
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      toast.warning('দয়া করে ওটিপি কোডটি লিখুন।');
      return;
    }

    if (settings.fraud_check_enabled === 'true' && !advancePaymentInfo.advance_transaction_id) {
      toast.error('দয়া করে অগ্রিম পেমেন্টের ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setVerifyingOtp(true);
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
      };

      const orderData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        total_amount: grandTotal,
        otp: otpCode,
        fbclid: localStorage.getItem('ghani_fbclid') || '',
        utm_source: localStorage.getItem('ghani_utm_source') || '',
        utm_medium: localStorage.getItem('ghani_utm_medium') || '',
        utm_campaign: localStorage.getItem('ghani_utm_campaign') || '',
        fbp: getCookie('_fbp') || '',
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          variant_id: item.variant_id || null
        })),
        advance_payment_method: settings.fraud_check_enabled === 'true' ? advancePaymentInfo.advance_payment_method : null,
        advance_transaction_id: settings.fraud_check_enabled === 'true' ? advancePaymentInfo.advance_transaction_id : null,
        buyer_success_rate: null,
        buyer_total_orders: null,
        buyer_failed_orders: null,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: couponDiscount,
        points_used: pointsDiscount
      };

      const res = await axios.post(`${API_URL}/api/orders/verify-otp`, orderData);

      if (res.data.success) {
        trackEvent('Lead', {
          value: grandTotal,
          currency: 'BDT',
          order_id: res.data.order_id
        }, {
          phone: formData.phone,
          email: formData.email || ''
        });

        if (res.data.user) {
          localStorage.setItem('customer_user', JSON.stringify(res.data.user));
          window.dispatchEvent(new Event('customer-user-updated'));
        }

        if (saveToAddressBook && res.data.user) {
          const exists = userAddresses.some(a => a.address === formData.address);
          if (!exists) {
            await axios.post(`${API_URL}/api/customer/addresses`, {
              user_phone: res.data.user.phone,
              label: 'Checkout Address',
              address: formData.address,
              is_default: true
            }).catch(console.error);
          }
        }

        localStorage.removeItem('ghani_cart');
        window.dispatchEvent(new Event('cart-updated'));

        toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
        setShowOtpModal(false);
        setFormData({
          customer_name: '',
          phone: '',
          email: '',
          address: '',
          delivery_zone: 'inside',
          payment: 'cod'
        });

        navigate('/thank-you', {
          state: {
            orderId: res.data.order_id,
            customerName: formData.customer_name,
            phone: formData.phone,
            address: formData.address,
            total: grandTotal,
            productName: cart[0]?.name || 'সরিষার তেল',
            variantName: cart[0]?.variant_name || '',
            items: cart
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="bg-background text-on-surface selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
      <style>{`
        body { font-family: 'Manrope', sans-serif; }
        .glass-panel { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px rgba(45, 75, 62, 0.08); }
        .bg-brand-green { background-color: var(--brand-green); }
        .text-brand-green { color: var(--brand-green); }
        .border-brand-green { border-color: var(--brand-green); }
        .bg-brand-yellow { background-color: var(--brand-yellow); }
        .bg-soft-yellow { background-color: #fdf8e6; }
        .bg-soft-red { background-color: #fff1f1; }
        .hero-banner-bg { background: var(--theme-gradient, #fefce8); }
        .order-section-bg { background-color: var(--brand-green-hover); }
      `}</style>

      {/* Reusable Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-10 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Order Form */}
          <div className="lg:col-span-7 space-y-gutter">
            <section className="glass-panel rounded-xl p-8 md:p-12">
              <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary mb-8">চেকআউট</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-on-surface-variant font-body-md mb-2">আপনার নাম</label>
                    <input
                      required
                      className="w-full bg-white/40 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 outline-none transition-all duration-200"
                      placeholder="পুরো নাম লিখুন"
                      type="text"
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant font-body-md mb-2">ফোন নম্বর</label>
                    <div className="relative">
                      <input
                        required
                        className="w-full bg-white/40 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 outline-none transition-all duration-200"
                        placeholder="০১৭XXXXXXXX"
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  {settings.otp_enabled !== false && settings.otp_type === 'email' && (
                    <div>
                      <label className="block text-on-surface-variant font-body-md mb-2">ইমেইল ঠিকানা (Email Address)</label>
                      <input
                        required
                        className="w-full bg-white/40 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 outline-none transition-all duration-200"
                        placeholder="example@gmail.com"
                        type="email"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Delivery Zone Selection */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-on-surface-variant font-body-md mb-2">ডেলিভারি এরিয়া</label>
                    <select
                      className="w-full bg-white/40 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 outline-none transition-all duration-200 font-semibold"
                      value={formData.delivery_zone}
                      onChange={e => setFormData({ ...formData, delivery_zone: e.target.value })}
                    >
                      <option value="inside">ঢাকার ভিতরে (৳{settings.delivery_inside_dhaka || 60})</option>
                      <option value="outside">ঢাকার বাইরে (৳{settings.delivery_outside_dhaka || 120})</option>
                    </select>
                  </div>
                </div>



                {/* Address */}
                <div>
                  <label className="block text-on-surface-variant font-body-md mb-2">পুরো ডেলিভারি ঠিকানা</label>
                  {customerUser && userAddresses.length > 0 && (
                    <div className="bg-white/30 border border-outline-variant p-4 rounded-lg mb-3">
                      <span className="block text-xs font-bold text-gray-700 mb-2">আপনার সংরক্ষিত ঠিকানা থেকে সিলেক্ট করুন:</span>
                      <div className="flex flex-wrap gap-2">
                        {userAddresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, address: addr.address }))}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold text-left transition ${
                              formData.address === addr.address
                                ? 'border-[#2d4b3e] bg-green-50 text-[#2d4b3e] ring-1 ring-[#2d4b3e]'
                                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <strong>{addr.label}</strong>: {addr.address.substring(0, 35)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    required
                    className="w-full bg-white/40 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 outline-none transition-all duration-200"
                    placeholder="বাসা নং, রোড নং, এলাকা এবং জেলা"
                    rows="3"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                  
                  {customerUser && (
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mt-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={saveToAddressBook} 
                        onChange={e => setSaveToAddressBook(e.target.checked)} 
                        className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e]"
                      />
                      <span>এই ঠিকানাটি আমার এড্রেস বুকে সংরক্ষণ করুন (Save in Address Book)</span>
                    </label>
                  )}
                </div>

                {/* Payment Method */}
                <div className="pt-4">
                  <label className="block text-on-surface-variant font-body-md mb-4">পেমেন্ট পদ্ধতি</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`relative flex items-center p-4 cursor-pointer glass-panel rounded-lg border transition-all ${formData.payment === 'cod' ? 'border-primary-container bg-secondary-container/20' : 'border-transparent hover:border-outline-variant'}`}
                    >
                      <input
                        className="w-4 h-4 text-primary border-outline focus:ring-primary"
                        name="payment"
                        type="radio"
                        checked={formData.payment === 'cod'}
                        onChange={() => setFormData({ ...formData, payment: 'cod' })}
                      />
                      <div className="ml-4">
                        <span className={`block font-bold ${formData.payment === 'cod' ? 'text-primary' : 'text-on-surface'}`}>Cash on Delivery</span>
                        <span className="text-sm text-on-surface-variant">
                          {settings.fraud_check_enabled === 'true' ? 'ডেলিভারি চার্জ অগ্রিম প্রযোজ্য' : 'পণ্য হাতে পেয়ে টাকা দিন'}
                        </span>
                      </div>
                    </label>
                    <label
                      className={`relative flex items-center p-4 cursor-pointer glass-panel rounded-lg border transition-all ${formData.payment === 'online' ? 'border-primary-container bg-secondary-container/20' : 'border-transparent hover:border-outline-variant'}`}
                    >
                      <input
                        className="w-4 h-4 text-primary border-outline focus:ring-primary"
                        name="payment"
                        type="radio"
                        checked={formData.payment === 'online'}
                        onChange={() => setFormData({ ...formData, payment: 'online' })}
                      />
                      <div className="ml-4">
                        <span className={`block font-bold ${formData.payment === 'online' ? 'text-primary' : 'text-on-surface'}`}>Online Payment</span>
                        <span className="text-sm text-on-surface-variant">বিকাশ বা কার্ডের মাধ্যমে</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Fraud Instructions Warning Panel & TrxID Input */}
                {settings.fraud_check_enabled === 'true' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl text-sm space-y-3">
                      <p className="font-bold flex items-center gap-1.5 text-base text-red-900">
                        ⚠️ অর্ডার কনফার্ম করতে অগ্রিম পেমেন্ট করুন
                      </p>
                      <p className="text-xs leading-relaxed font-semibold">
                        {settings.fraud_advance_instructions || 'আমাদের সিস্টেমে অর্ডারটি কনফার্ম করতে দয়া করে অগ্রিম চার্জটি নিচে দেওয়া নাম্বারে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি প্রদান করুন।'}
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-red-100 mt-2 text-xs font-mono space-y-1.5 text-gray-800 shadow-sm">
                        <div><strong>পেমেন্ট মাধ্যম:</strong> bKash / Nagad / Rocket (সেন্ড মানি)</div>
                        <div><strong>নাম্বার:</strong> <span className="font-bold text-[#2d4b3e] text-sm select-all">{settings.fraud_advance_payment_number}</span></div>
                        <div><strong>অগ্রিম চার্জের পরিমাণ:</strong> <span className="font-bold text-red-600 text-sm">৳{settings.fraud_advance_amount_type === 'custom' ? settings.fraud_advance_custom_amount : deliveryCharge}</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-4">
                      <h4 className="font-bold text-sm text-gray-800 border-b pb-2">অগ্রিম পেমেন্ট ভেরিফিকেশন (TrxID)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">পেমেন্ট মেথড</label>
                          <select 
                            className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none cursor-pointer font-semibold"
                            value={advancePaymentInfo.advance_payment_method}
                            onChange={e => setAdvancePaymentInfo({ ...advancePaymentInfo, advance_payment_method: e.target.value })}
                          >
                            {(settings.advance_payment_methods || 'bkash,nagad,rocket').split(',').map(method => (
                              <option key={method} value={method}>
                                {method === 'bkash' ? 'bKash (বিকাশ)' : method === 'nagad' ? 'Nagad (নগদ)' : 'Rocket (রকেট)'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">Transaction ID (TrxID)</label>
                          <input 
                            required
                            type="text"
                            placeholder="e.g. 9J283KSK2J"
                            className="w-full bg-white border border-gray-350 rounded-lg p-2.5 text-xs outline-none font-mono uppercase font-bold text-gray-800"
                            value={advancePaymentInfo.advance_transaction_id}
                            onChange={e => setAdvancePaymentInfo({ ...advancePaymentInfo, advance_transaction_id: e.target.value.toUpperCase() })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary font-headline-lg py-4 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'প্রসেসিং হচ্ছে...' : 'অর্ডারটি নিশ্চিত করুন'}
                    {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-32 space-y-gutter">
            <div className="glass-panel rounded-xl overflow-hidden p-6 md:p-8">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6">আপনার অর্ডার</h2>

              {/* Product Item List */}
              <div className="space-y-4 pb-6 border-b border-outline-variant/20 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-4">কার্ট খালি আছে</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-outline-variant/10 last:border-b-0 last:pb-0 relative group">
                      <div className="w-24 h-24 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          className="w-full h-full object-cover"
                          alt={item.name}
                          src={item.image || "/assets/img/hero.png"}
                        />
                      </div>
                      <div className="flex-1 pr-8">
                        <h3 className="font-bold text-on-surface font-body-md">{item.name}</h3>
                        <p className="text-on-surface-variant text-sm">পরিমাণ: {item.quantity} বোতল</p>
                        {item.variant_name && <p className="text-on-surface-variant text-xs font-semibold">সাইজ: {item.variant_name}</p>}
                        <p className="text-primary font-bold mt-1">৳{item.price * item.quantity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        className="absolute right-0 top-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition"
                        title="রিমুভ করুন"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon and Loyalty Section */}
              <div className="py-4 space-y-4 border-b border-outline-variant/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুপন কোড (যদি থাকে)"
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-sm outline-none uppercase"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    disabled={appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCodeInput}
                      className="bg-[#2d4b3e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {applyingCoupon ? '...' : 'প্রয়োগ করুন'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponCodeInput(''); setUsePoints(false); }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                    >
                      বাতিল
                    </button>
                  )}
                </div>

                {availablePoints > 0 && (
                  <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div>
                      <p className="text-sm font-bold text-gray-800">লয়ালটি পয়েন্ট আছে: {availablePoints}</p>
                      {parseInt(settings.loyalty_max_points_per_order) > 0 && (
                        <p className="text-xs text-gray-600">সর্বোচ্চ ব্যবহারযোগ্য: {settings.loyalty_max_points_per_order}</p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-[#2d4b3e]"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                      />
                      <span className="text-sm font-bold text-[#2d4b3e]">ব্যবহার করুন</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="py-6 space-y-3">
                <div className="flex justify-between text-on-surface-variant font-body-md">
                  <span>পণ্যের মূল্য</span>
                  <span>৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-body-md">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-body-md font-bold">
                    <span>কুপন ডিসকাউন্ট (-{appliedCoupon?.discount_percent}%)</span>
                    <span>-৳{couponDiscount}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-body-md font-bold">
                    <span>লয়ালটি পয়েন্ট ডিসকাউন্ট</span>
                    <span>-৳{pointsDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                <div>
                  <p className="text-on-surface-variant text-sm font-label-sm">সর্বমোট</p>
                  <p className="text-headline-lg text-primary font-bold">৳{grandTotal}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {cart.some(item => item.offer_type === 'free_gift' && item.free_gift_text) && (
                    <div className="bg-secondary-container/40 px-3 py-1 rounded-full text-secondary font-label-sm text-sm font-bold animate-pulse">
                      🎁 উপহার: {cart.find(item => item.offer_type === 'free_gift' && item.free_gift_text)?.free_gift_text}
                    </div>
                  )}
                  {cart.some(item => item.offer_type === 'free_delivery') && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-label-sm text-sm font-bold">
                      🚚 ফ্রি ডেলিভারি
                    </div>
                  )}
                  {cart.some(item => item.offer_type === 'price_discount' || item.offer_type === 'discount') && (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-label-sm text-sm font-bold">
                      🏷️ বিশেষ ছাড় অন্তর্ভুক্ত
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="glass-panel rounded-xl p-6 flex items-center gap-4 border-l-4 border-primary">
              <span className="material-symbols-outlined text-primary scale-125">verified_user</span>
              <div>
                <p className="font-bold text-primary font-body-md">১০০% বিশুদ্ধতার নিশ্চয়তা</p>
                <p className="text-sm text-on-surface-variant">আমরা সরাসরি ঘানি ভাঙ্গা তেল সরবরাহ করি</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {/* Reusable Footer */}
      <Footer />

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-green">{settings.otp_type === 'email' ? 'ইমেইল ভেরিফিকেশন' : 'মোবাইল নম্বর ভেরিফিকেশন'}</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {settings.otp_type === 'email' ? (
                <>আপনার <strong>{formData.email}</strong> ইমেইলে একটি ওটিপি (OTP) পাঠানো হয়েছে। ওটিপি কোডটি নিচের বক্সে লিখুন।</>
              ) : (
                <>আপনার <strong>{formData.phone}</strong> নম্বরে একটি ওটিপি (OTP) পাঠানো হয়েছে। ওটিপি কোডটি নিচের বক্সে লিখুন।</>
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
