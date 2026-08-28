import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, CheckCircle2, Star, Sparkles, Sprout } from 'lucide-react';
import API_URL from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HealthBenefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`${API_URL}/api/beneficial-contents`)
      .then(res => {
        setBenefits(res.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const parseJsonSafe = (str) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Header cartCount={0} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 relative z-10" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            তেলের স্বাস্থ্য উপকারিতা
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            আমাদের কোল্ড প্রেসড তেলের অসাধারণ পুষ্টিগুণ এবং এর বিস্তারিত উপকারিতা সম্পর্কে জানুন।
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-24">
            {benefits.length > 0 ? benefits.map((benefit, index) => {
              const keyPoints = parseJsonSafe(benefit.key_points);
              const benefitsPoints = parseJsonSafe(benefit.benefits_points);
              const isEven = index % 2 === 0;

              return (
                <section key={benefit.id} className="scroll-mt-32" id={`benefit-${benefit.id}`}>
                  <div className={`flex flex-col gap-12 lg:gap-20 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}>
                    
                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 relative group">
                      <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3 scale-105 transition-transform group-hover:rotate-6"></div>
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white aspect-[4/3] flex items-center justify-center">
                        {benefit.detailed_image ? (
                          <img src={benefit.detailed_image} alt={benefit.detailed_title || benefit.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-brand-green/20 flex flex-col items-center">
                            <Sprout className="w-32 h-32" />
                            <span className="text-xl font-bold mt-4">Ghani Natural</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full lg:w-1/2 space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        {benefit.title}
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {benefit.detailed_title || benefit.title}
                      </h2>
                      
                      <p className="text-lg text-gray-600 leading-relaxed font-medium">
                        {benefit.detailed_short_description || benefit.short_description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-8 pt-4">
                        {keyPoints.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-primary flex items-center gap-2 border-b pb-2">
                              <Star className="w-5 h-5" /> মূল বৈশিষ্ট্য
                            </h4>
                            <ul className="space-y-3">
                              {keyPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                  <span className="leading-snug">{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {benefitsPoints.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-secondary flex items-center gap-2 border-b pb-2">
                              <Heart className="w-5 h-5" /> উপকারিতা
                            </h4>
                            <ul className="space-y-3">
                              {benefitsPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                                  <span className="leading-snug">{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {benefit.detailed_content && (
                        <div 
                          className="pt-6 mt-6 border-t prose prose-green max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: benefit.detailed_content }}
                        />
                      )}
                    </div>
                  </div>
                </section>
              );
            }) : (
              <div className="text-center py-20 text-gray-500 font-medium">
                বর্তমানে কোনো বিস্তারিত তথ্য নেই।
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
