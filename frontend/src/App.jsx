import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from './utils/api';
import StoreFront from './pages/StoreFront';
import Dashboard from './pages/admin/Dashboard';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import MultiProductCatalog from './pages/MultiProductCatalog';
import Login from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import EmailMarketing from './pages/admin/EmailMarketing';
import SystemSettings from './pages/admin/SystemSettings';
import BannerManagement from './pages/admin/BannerManagement';
import WebsiteManagement from './pages/admin/WebsiteManagement';
import AnalyticsReports from './pages/admin/AnalyticsReports';
import SEOMetaTags from './pages/admin/SEOMetaTags';
import CourierManagement from './pages/admin/CourierManagement';
import AccountManagement from './pages/admin/AccountManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import DummyComponent from './pages/admin/DummyComponent';
import Coupons from './pages/admin/Coupons';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import { initTracker } from './utils/tracker';

const darkenColor = (hex, percent) => {
  if (!hex || hex[0] !== '#') return hex || '#2d4b3e';
  try {
    let num = parseInt(hex.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
  } catch (e) {
    return hex;
  }
};

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          clearInterval(interval);
        }
        attempts++;
        if (attempts > 30) { // Try for 3 seconds (30 * 100ms)
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  useEffect(() => {
    // Parse URL params for UTMs and fbclid
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');

      if (fbclid) localStorage.setItem('ghani_fbclid', fbclid);
      if (utm_source) localStorage.setItem('ghani_utm_source', utm_source);
      if (utm_medium) localStorage.setItem('ghani_utm_medium', utm_medium);
      if (utm_campaign) localStorage.setItem('ghani_utm_campaign', utm_campaign);
    } catch (e) {
      console.error('Failed to parse UTM / fbclid params', e);
    }

    initTracker();
    
    // Fetch settings and apply custom theme styles
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data) {
          const primaryColor = res.data.theme_primary_color || '#2d4b3e';
          const accentColor = res.data.theme_accent_color || '#f7b700';
          const darkPrimary = darkenColor(primaryColor, -10);
          const gradient = res.data.theme_gradient || '#fefce8';
          
          let styleTag = document.getElementById('dynamic-theme-style');
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-theme-style';
            document.head.appendChild(styleTag);
          }
          styleTag.innerHTML = `
            :root {
              --brand-green: ${primaryColor};
              --brand-yellow: ${accentColor};
              --brand-green-hover: ${darkPrimary};
              --theme-gradient: ${gradient};
            }
          `;
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/products" element={<MultiProductCatalog />} />
        <Route path="/product/:idOrSlug" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="marketing" element={<EmailMarketing />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="website" element={<WebsiteManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="analytics" element={<AnalyticsReports />} />
          <Route path="seo" element={<SEOMetaTags />} />
          <Route path="courier" element={<CourierManagement />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="account" element={<AccountManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
