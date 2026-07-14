import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';

export default function Footer() {
  const [settings, setSettings] = useState({
    store_name: 'Ghani',
    store_phone: '01872-345678',
    whatsapp_number: '01872345678',
    site_title: 'Ghani',
    store_description: 'আমরা সরাসরি গ্রাম থেকে বীজ সংগ্রহ করে ঘানিতে ভাঙানো বিশুদ্ধ সরিষার তেল সরবরাহ করি। আমাদের লক্ষ্য সুস্থ ও নিরাপদ খাদ্য নিশ্চিত করা।',
    social_links_json: '',
    contact_email: 'info@khatitel.com',
    contact_phone: '01872-345678',
    store_address: 'ঢাকা, বাংলাদেশ',
    social_facebook: 'https://facebook.com/'
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(console.error);
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
    if (lower.includes('twitter') || lower === 'x') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      );
    }
    if (lower.includes('linkedin')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
        </svg>
      );
    }
    if (lower.includes('pinterest')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.43-6.07 1.43-6.07s-.36-.73-.36-1.8c0-1.68.97-2.94 2.19-2.94 1.03 0 1.53.78 1.53 1.7 0 1.04-.66 2.6-1 4.04-.29 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.07-4.9-5.03-4.9-3.43 0-5.44 2.57-5.44 5.22 0 1.04.4 2.15.9 2.75.1.12.11.23.08.35l-.33 1.34c-.05.22-.17.27-.4.16-1.5-.7-2.44-2.88-2.44-4.63 0-3.77 2.74-7.23 7.9-7.23 4.14 0 7.37 2.95 7.37 6.9 0 4.12-2.6 7.43-6.2 7.43-1.2 0-2.35-.63-2.73-1.37l-.75 2.85c-.27 1.04-1 2.35-1.5 3.16C10.74 23.83 11.36 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
        </svg>
      );
    }
    if (lower.includes('tiktok')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.17 1.02.89 2.34 1.48 3.72 1.62.01 1.3-.01 2.6.01 3.89-.96-.03-1.92-.26-2.8-.68-.86-.45-1.62-1.09-2.22-1.85v5.33c.01 1.68-.45 3.32-1.34 4.74-.91 1.25-2.22 2.16-3.71 2.6-1.46.4-3 .31-4.4-.27-1.41-.67-2.55-1.84-3.21-3.28-.7-1.7-.64-3.66.17-5.3.74-1.33 1.98-2.37 3.44-2.88 1.4-.41 2.89-.28 4.2.36v3.91c-.72-.34-1.52-.47-2.3-.37-.76.12-1.47.51-1.98 1.09-.58.7-.84 1.62-.71 2.53.13.84.6 1.59 1.3 2.05.77.47 1.7.57 2.55.26.83-.34 1.5-1 1.83-1.83.18-.54.24-1.12.22-1.7V.02z"/>
        </svg>
      );
    }
    if (lower.includes('threads')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.75 2c5.937 0 10.75 4.813 10.75 10.75S18.687 23.5 12.75 23.5 2 18.687 2 12.75 6.813 2 12.75 2zm1.889 15.35c.801 0 1.48-.198 2.037-.594a3.8 3.8 0 0 0 1.305-1.616c.321-.806.481-1.748.481-2.827V9.62c0-1.118-.184-2.072-.553-2.864a4.195 4.195 0 0 0-1.558-1.884C15.589 4.382 14.595 4 13.376 4c-1.344 0-2.443.435-3.298 1.306-.856.871-1.284 2.033-1.284 3.486v1.942c0 .77.108 1.455.326 2.057.218.602.555 1.082 1.01 1.442.455.36 1.018.54 1.69.54.542 0 .993-.11 1.353-.332.36-.222.625-.522.793-.9.123.36.335.65.637.873.301.222.68.333 1.138.333z"/>
        </svg>
      );
    }
    if (lower.includes('snapchat')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .002c-1.657 0-3.313.328-4.57 1.02-.924.508-1.533 1.258-1.533 2.062 0 .504.256.97.747 1.332C7.228 4.857 7.9 5 8.5 5c.422 0 .828-.078 1.2-.232l.707.994c-.452.41-.807.828-1.037 1.256-.253.468-.37.954-.37 1.482 0 1.2.98 2 2.5 2 .748 0 1.365-.184 1.838-.544l.872 1.398c-.687.56-1.5.846-2.41.846-2.528 0-4.3-1.636-4.3-4.1 0-.904.234-1.748.7-2.532C6.73 3.636 5 2 5 .7c0-2.3 2.72-3.7 7-3.7s7 1.4 7 3.7c0 1.336-1.73 2.936-3.2 4.186.466.784.7 1.628.7 2.532 0 2.464-1.772 4.1-4.3 4.1-.91 0-1.723-.286-2.41-.846l.872-1.398c.473.36 1.09.544 1.838.544 1.52 0 2.5-.8 2.5-2 0-.528-.117-1.014-.37-1.482-.23-.428-.585-.846-1.037-1.256l.707-.994c.372.154.778.232 1.2.232.6 0 1.272-.143 1.856-.584.49-.362.747-.828.747-1.332 0-.804-.61-1.554-1.533-2.062C15.313.33 13.657.002 12 .002z"/>
        </svg>
      );
    }
    if (lower.includes('whatsapp')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    }
    if (lower.includes('telegram')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.93 9.09c-.14.65-.53.81-1.08.5l-2.94-2.17-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.22-.05-.34-.37-.13l-6.78 4.27-2.92-.91c-.64-.2-.65-.64.13-.94l11.39-4.39c.53-.19.99.13.82.94z"/>
        </svg>
      );
    }
    if (lower.includes('gmail') || lower.includes('email') || lower.includes('mail')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      );
    }
    if (lower.includes('reddit')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-.762 1.156c.037.2.057.404.057.61 0 1.764-2.1 3.2-4.688 3.2-2.589 0-4.689-1.436-4.689-3.2 0-.2.02-.4.053-.598A1.25 1.25 0 0 1 7.24 6c0-.688.562-1.25 1.25-1.25a1.24 1.24 0 0 1 .958.455c1.02-.387 2.378-.636 3.864-.67l.82-2.576 2.668.568c.026-.532.463-.952.998-.952a1.002 1.002 0 0 1 1.001 1c0 .554-.447 1.002-1.001 1.002-.519 0-.943-.396-.992-.907l-2.39-.508-.718 2.27c1.517.026 2.9.278 3.937.67a1.23 1.23 0 0 1 .958-.444zM9.5 9c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm5 0c-.553 0-1-.448-1-1s.447-1 1-1 1 .448 1 1-.447 1-1 1zm-4.99 3.012c.113 0 .22.046.3.125.753.753 2.127.753 2.88 0a.426.426 0 0 1 .6 0 .426.426 0 0 1 0 .6c-1.085 1.085-2.995 1.085-4.08 0a.426.426 0 0 1 0-.6.426.426 0 0 1 .3-.125z"/>
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

  return (
    <footer id="contact" className="bg-brand-green text-white py-12 pb-32 font-bengali">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img alt="Logo" className="w-10 h-10 rounded-full border-2 border-white" src="/assets/img/ghani.png" />
              <div>
                <h4 className="text-xl font-bold leading-none">{settings.site_title || settings.store_name || 'Ghani'}</h4>
                <p className="text-[10px] opacity-80">১০০% খাঁটি পণ্য</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {settings.store_description}
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 border-l-4 border-brand-yellow pl-3">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-brand-yellow"><Link to="/">হোম</Link></li>
              <li className="hover:text-brand-yellow"><Link to="/#why-choose">আমাদের সম্পর্কে</Link></li>
              <li className="hover:text-brand-yellow"><Link to="/#why-oil">কেন আমাদের তেল?</Link></li>
              <li className="hover:text-brand-yellow"><Link to="/#testimonials">গ্রাহকের মতামত</Link></li>
              <li className="hover:text-brand-yellow"><Link to="/#order">যোগাযোগ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 border-l-4 border-brand-yellow pl-3">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>📍 {settings.store_address || 'ঢাকা, বাংলাদেশ'}</li>
              <li>📞 {settings.contact_phone || settings.store_phone}</li>
              <li>✉️ {settings.contact_email || 'info@khatitel.com'}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 border-l-4 border-brand-yellow pl-3">সোশ্যাল মিডিয়া</h4>
            <div className="flex gap-4">
              {(() => {
                let links = [];
                if (settings.social_links_json) {
                  try {
                    links = JSON.parse(settings.social_links_json).filter(link => link.status === 'Show' && link.url && link.name);
                  } catch (e) {}
                }
                if (links.length === 0) {
                  return (
                    <a 
                      className="bg-white/10 p-2 rounded-full hover:bg-brand-yellow hover:text-black transition" 
                      href={settings.social_facebook || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                      </svg>
                    </a>
                  );
                }
                return links.map((link, idx) => (
                  <a 
                    key={idx}
                    className="bg-white/10 p-2 rounded-full hover:bg-brand-yellow hover:text-black transition" 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                  >
                    {renderSocialIcon(link.name)}
                  </a>
                ));
              })()}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-gray-400">
          <p>© ২০২৪ খাঁটি তেল - সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
