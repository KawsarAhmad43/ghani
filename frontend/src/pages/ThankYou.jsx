import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ThankYou() {
  const location = useLocation();
  const state = location.state || {};
  const orderId = rawOrderId ? (isNaN(rawOrderId) ? rawOrderId : (100000 + (Number(rawOrderId) * 13579 + 382153) % 900000).toString()) : '495732';
  const address = state.address || 'Dhanmondi, Dhaka';
  const total = state.total || 690;
  
  // Construct items from state
  const items = state.items || (state.productName ? [{
    name: state.productName,
    variant_name: state.variantName,
    price: state.total - 50, // estimate item cost if not explicit
    quantity: 1
  }] : [
    {
      name: 'Khati Mustard Oil',
      variant_name: '1L',
      price: 640,
      quantity: 2
    }
  ]);

  return (
    <div 
      className="bg-background text-on-surface font-body-md min-h-screen flex flex-col" 
      style={{
        backgroundImage: "linear-gradient(rgba(251, 249, 248, 0.9), rgba(251, 249, 248, 0.9)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuAneiGZFpF-441so6uIMHndSOMrXsRC-eakZee0v3yS8m1zxQ_rEyz2087NSCnQGc1HqqfCeurtHNoxVYhtpZS6_lD0LOZu4cvkQcjjPDZqrvm2ICZQFGmQKTmijT7KsvQPDDymyOC-XiSpB6XwGNeYiMcO0h2yvhFf3wCEAvaZFchZOMwnfxVi8yNMYv66zgdbV76QCzZoSJP-eHBsq_XJB5O5ftnWsVMP3A17HJJOSbi0fOORexQRaDN-KUL0y2os7iqtlnEXfB-l)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <style>{`
        .font-bengali {
          font-family: "Hind Siliguri", sans-serif
        }
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24
        }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4)
        }
        .bg-brand-green { background-color: var(--brand-green); }
        .text-brand-green { color: var(--brand-green); }
        .border-brand-green { border-color: var(--brand-green); }
        .bg-brand-yellow { background-color: var(--brand-yellow); }
        .bg-soft-yellow { background-color: #fdf8e6; }
        .bg-soft-red { background-color: #fff1f1; }
        .hero-banner-bg { background-color: #fefce8; }
        .order-section-bg { background-color: var(--brand-green-hover); }
      `}</style>

      {/* Reusable Header */}
      <Header />

      {/* Success Content */}
      <main className="flex-grow pt-10 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex items-center justify-center">
         <div className="w-full max-w-2xl text-center">
          {/* Success Icon & Header */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(45,75,62,0.08)] animate-bounce">
              <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
            </div>
            <h1 className="font-bengali font-headline-xl text-primary mb-4 leading-tight">আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h1>
            <p className="font-body-md text-on-surface-variant">Thank you for choosing purity. Your order {orderId} has been placed.</p>
          </div>

          {/* Bento-Style Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Delivery Info */}
            <div className="liquid-glass rounded-xl p-8 text-left shadow-[0_8px_32px_rgba(45,75,62,0.08)]">
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <span className="material-symbols-outlined">local_shipping</span>
                <span className="font-label-sm uppercase tracking-wider">Estimated Delivery</span>
              </div>
              <p className="text-headline-lg font-headline-lg text-primary">24 - 48 Hours</p>
              <p className="text-body-md text-on-surface-variant mt-2">Delivery to: {address}</p>
            </div>

            {/* Order Summary */}
            <div className="liquid-glass rounded-xl p-8 text-left shadow-[0_8px_32px_rgba(45,75,62,0.08)]">
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <span className="material-symbols-outlined">shopping_basket</span>
                <span className="font-label-sm uppercase tracking-wider">Order Summary</span>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant text-left">
                      {item.quantity}x {item.name} {item.variant_name ? `(${item.variant_name})` : ''}
                    </span>
                    <span className="font-bold text-primary">৳{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between text-body-md border-t border-outline-variant/20 pt-2">
                  <span className="text-on-surface-variant">Total Paid</span>
                  <span className="font-bold text-primary text-lg">৳{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Reinforcement */}
          <div className="mb-12 relative h-48 overflow-hidden rounded-xl shadow-md">
            <img 
              alt="Organic Mustard Fields" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaU6oJ_UwSNrSMwqLCTgNhMG-k029D-PPKY2po_uh6iqtxzxwIxcB6P1ZRpYPETx1JSDwXngbZEzY9TPQ7Q450AMDWKz9-OFzuAsglIhxDsMNqJmC8ruE09CWXiwGJ3VDnNTRR7WsRG8kIH5qDSPuIKA5qs_Qp70gMoiminH7Ajy3ZzSIQclvS1VluUA2iWzUi-kAA26JkKm-fJd-3yq_ZmYGzfCEPUesXUEvHn9T-_8_n_2VaARbIUL6nIB2N98Go0kH9Mz5DwEWj" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-6">
              <p className="text-white font-body-md text-left max-w-sm italic">"From our heritage fields to your kitchen, purity is our only ingredient."</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-primary text-on-primary font-body-md font-bold px-10 py-4 rounded-full shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center"
            >
              Continue Shopping
            </Link>
            <button className="liquid-glass text-primary border border-primary/20 font-body-md font-bold px-10 py-4 rounded-full hover:bg-primary/5 transition-all duration-300">
              Track Order
            </button>
          </div>
        </div>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}
