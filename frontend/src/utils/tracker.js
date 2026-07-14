import axios from 'axios';
import API_URL from './api';

// Singleton for tracking data
let trackingConfig = null;


export const initTracker = async () => {
    if (window.__tracker_initialized) return;
    try {
        const res = await axios.get(`${API_URL}/api/settings`);
        trackingConfig = {
            gtm_id: res.data.gtm_id || '',
            pixel_id: res.data.pixel_id || '',
            ga4_id: res.data.ga4_id || '',
            google_ads_id: res.data.google_ads_id || '',
            google_ads_label: res.data.google_ads_label || '',
            test_event_code: res.data.test_event_code || '',
            server_side_enabled: res.data.server_side_enabled === 'true' || res.data.server_side_enabled === true,
            event_tracking: res.data.event_tracking === 'true' || res.data.event_tracking === true || res.data.event_tracking === undefined
        };
        
        if (!trackingConfig.event_tracking) return;
        window.__tracker_initialized = true;

        // 1. Inject Google Tag Manager (GTM)
        if (trackingConfig.gtm_id) {
            const script = document.createElement('script');
            script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${trackingConfig.gtm_id}');`;
            document.head.appendChild(script);
        }

        // 2. Inject Meta (Facebook) Pixel
        if (trackingConfig.pixel_id) {
            const fbScript = document.createElement('script');
            fbScript.innerHTML = `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${trackingConfig.pixel_id}');
            fbq('track', 'PageView');`;
            document.head.appendChild(fbScript);
        }

        // 3. Inject Google Analytics 4 (GA4)
        if (trackingConfig.ga4_id) {
            const gaScript1 = document.createElement('script');
            gaScript1.async = true;
            gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingConfig.ga4_id}`;
            document.head.appendChild(gaScript1);

            const gaScript2 = document.createElement('script');
            gaScript2.innerHTML = `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingConfig.ga4_id}');`;
            document.head.appendChild(gaScript2);
        }

        // 4. Inject Google Ads Tag
        if (trackingConfig.google_ads_id) {
            const adsScript1 = document.createElement('script');
            adsScript1.async = true;
            adsScript1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_ads_id}`;
            document.head.appendChild(adsScript1);

            if (!window.gtag) {
                const adsScript2 = document.createElement('script');
                adsScript2.innerHTML = `window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());`;
                document.head.appendChild(adsScript2);
            }

            const adsScript3 = document.createElement('script');
            adsScript3.innerHTML = `gtag('config', '${trackingConfig.google_ads_id}');`;
            document.head.appendChild(adsScript3);
        }

    } catch (err) {
        console.warn('Analytics config could not be loaded dynamically', err);
    }
};

export const trackEvent = async (eventName, eventData = {}, userData = {}) => {
    if (!trackingConfig || !trackingConfig.event_tracking) return;

    // Generate unique Event ID for deduplication
    const eventId = `evt_${eventName}_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;

    // 1. Push to GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        event_id: eventId,
        ...eventData
    });

    // 2. Push to Google Analytics (gtag)
    if (window.gtag) {
        window.gtag('event', eventName, {
            event_id: eventId,
            ...eventData
        });
    }

    // 3. Push to Meta Pixel (fbq)
    if (window.fbq) {
        window.fbq('track', eventName, eventData, { eventID: eventId });
    }

    // 3.5 Push to Google Ads Conversion
    if (window.gtag && trackingConfig.google_ads_id && eventName === 'Lead') {
        window.gtag('event', 'conversion', {
            'send_to': `${trackingConfig.google_ads_id}/${trackingConfig.google_ads_label || ''}`,
            'value': eventData.value || 0.0,
            'currency': eventData.currency || 'BDT',
            'transaction_id': eventData.order_id || ''
        });
    }

    // 4. Server-Side Proxy Call (CAPI & GA4 Server Proxy)
    if (trackingConfig.server_side_enabled) {
        try {
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return '';
            };

            await axios.post(`${API_URL}/api/tracking/server-event`, {
                event_name: eventName,
                event_data: eventData,
                event_id: eventId,
                timestamp: new Date().toISOString(),
                user_data: {
                    email: userData.email || '',
                    phone: userData.phone || '',
                    fbp: getCookie('_fbp'),
                    fbc: getCookie('_fbc'),
                    ...userData
                }
            });
        } catch (e) {
            console.error('Server-side tracking proxy dispatch failed', e);
        }
    }
};
