import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(null);
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678',
    site_title: 'Ghani',
    site_logo: '',
    store_mode: 'single',
    contact_phone: '',
    contact_email: '',
    store_slogan: ''
  });

  useEffect(() => {
    // Load Settings
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(console.error);

    // Sync Cart Count
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('ghani_cart') || '[]');
      const count = savedCart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    // Sync Customer User
    const updateCustomerUser = () => {
      const savedUser = localStorage.getItem('customer_user');
      if (savedUser) {
        setCustomerUser(JSON.parse(savedUser));
      } else {
        setCustomerUser(null);
      }
    };
    updateCustomerUser();
    window.addEventListener('customer-user-updated', updateCustomerUser);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('customer-user-updated', updateCustomerUser);
    };
  }, []);

  const handleNavClick = (e, hash) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b font-bengali">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Slogan */}
        <Link to="/" className="flex items-center gap-3">
          <img alt="Logo" className="w-12 h-12 rounded-full" src={settings.site_logo || "/assets/img/ghani.png"} />
          <div>
            <h1 className="text-2xl font-bold text-brand-green leading-none">{settings.site_title || settings.store_name || 'Ghani'}</h1>
            <p className="text-xs text-gray-600">{settings.store_slogan || 'ঘানিতে ভাঙানো সরিষার তেল'}</p>
          </div>
        </Link>
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          <Link className="hover:text-brand-green" to="/">হোম</Link>
          {(settings.store_mode?.toLowerCase() === 'multi' || settings.store_mode === 'Multi Product') && (
            <Link className="hover:text-brand-green" to="/products">পণ্যসমূহ</Link>
          )}
          <Link className="hover:text-brand-green" to="/#why-choose" onClick={(e) => handleNavClick(e, 'why-choose')}>আমাদের সম্পর্কে</Link>
          <Link className="hover:text-brand-green" to="/#why-oil" onClick={(e) => handleNavClick(e, 'why-oil')}>কেন আমাদের তেল?</Link>
          <Link className="hover:text-brand-green" to="/#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')}>গ্রাহকের মতামত</Link>
          <Link className="hover:text-brand-green" to="/#order" onClick={(e) => handleNavClick(e, 'order')}>অর্ডার করুন</Link>
          <Link className="hover:text-brand-green" to="/#contact" onClick={(e) => handleNavClick(e, 'contact')}>যোগাযোগ</Link>
        </nav>
        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart */}
          <Link className="relative p-2 text-gray-700 hover:text-brand-green transition" to="/checkout">
            <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="absolute top-0 right-0 bg-brand-yellow text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{cartCount}</span>
          </Link>
          {/* Customer User Profile / Login */}
          {customerUser ? (
            <Link className="p-2 text-gray-700 hover:text-brand-green transition flex items-center gap-1.5" to="/customer/dashboard" title="Dashboard">
              <svg className="h-6 w-6 md:h-7 md:w-7 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden lg:inline text-xs font-bold text-brand-green">{customerUser.name}</span>
            </Link>
          ) : (
            <Link className="p-2 text-gray-700 hover:text-brand-green transition" to="/customer/login" title="Login">
              <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
          {/* Contact Button */}
          <a className="bg-brand-green text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm md:text-base transition hover:opacity-90" href={`tel:${settings.contact_phone || settings.store_phone}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="hidden sm:inline">{settings.contact_phone || settings.store_phone}</span>
          </a>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-700 hover:text-brand-green p-2 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <nav className="flex flex-col p-4 space-y-3 font-medium text-gray-700">
            <Link onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-green" to="/">হোম</Link>
            {(settings.store_mode?.toLowerCase() === 'multi' || settings.store_mode === 'Multi Product') && (
              <Link onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-green" to="/products">পণ্যসমূহ</Link>
            )}
            <Link onClick={(e) => handleNavClick(e, 'why-choose')} className="hover:text-brand-green" to="/#why-choose">আমাদের সম্পর্কে</Link>
            <Link onClick={(e) => handleNavClick(e, 'why-oil')} className="hover:text-brand-green" to="/#why-oil">কেন আমাদের তেল?</Link>
            <Link onClick={(e) => handleNavClick(e, 'testimonials')} className="hover:text-brand-green" to="/#testimonials">গ্রাহকের মতামত</Link>
            <Link onClick={(e) => handleNavClick(e, 'order')} className="hover:text-brand-green" to="/#order">অর্ডার করুন</Link>
            <Link onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-brand-green" to="/#contact">যোগাযোগ</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
