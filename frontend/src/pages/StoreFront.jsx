import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { trackEvent, initTracker } from '../utils/tracker';
import API_URL from '../utils/api';
import SingleProductLanding from './SingleProductLanding';

export default function StoreFront() {
  const [storeMode, setStoreMode] = useState('single');
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    // Init trackers
    initTracker().then(() => trackEvent('PageView'));

    // Fetch settings and SEO
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data.store_mode) {
          setStoreMode(res.data.store_mode);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));

    axios.get(`${API_URL}/api/admin/seo`)
      .then(res => setSeo(res.data))
      .catch(err => console.error("Error fetching SEO:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-green font-bold">Loading...</div>;

  return (
    <>
      {seo && (
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="keywords" content={seo.keywords} />
          <meta property="og:title" content={seo.og_tags} />
          <meta name="twitter:title" content={seo.twitter_tags} />
          {seo.schema_markup && (
            <script type="application/ld+json">
              {seo.schema_markup}
            </script>
          )}
        </Helmet>
      )}
      <SingleProductLanding />
    </>
  );
}
