
import { useState, useEffect } from 'react';

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other';
  browser: string;
  supportsNotifications: boolean;
  isStandalone: boolean;
  isiOS: boolean;
  isiPad: boolean;
  isAndroid: boolean;
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
      let os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other' = 'other';
      let browser = 'unknown';
      
      // Detect if mobile or tablet
      const isIPad = /iPad|Macintosh/i.test(ua) && 'ontouchend' in document;
      
      if (isIPad || /tablet|PlayBook|Android(?!.*Mobile)/i.test(ua)) {
        deviceType = 'tablet';
      } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
        deviceType = 'mobile';
      }
      
      // Detect OS
      const isiOS = /iPhone|iPad|iPod/i.test(ua) || 
                    (isIPad || (/Mac/.test(ua) && 'ontouchend' in document));
      const isAndroid = /Android/i.test(ua);
      
      if (isiOS) {
        os = 'ios';
      } else if (isAndroid) {
        os = 'android';
      } else if (/Win/i.test(ua)) {
        os = 'windows';
      } else if (/Mac/i.test(ua)) {
        os = 'macos';
      } else if (/Linux|X11/i.test(ua)) {
        os = 'linux';
      }
      
      // Browser detection
      if (/CriOS|Chrome/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua)) {
        browser = 'Chrome';
      } else if (/Firefox/i.test(ua)) {
        browser = 'Firefox';
      } else if (/Safari/i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
        browser = 'Safari';
      } else if (/Edg/i.test(ua)) {
        browser = 'Edge';
      } else if (/OPR|Opera/i.test(ua)) {
        browser = 'Opera';
      } else if (/SamsungBrowser/i.test(ua)) {
        browser = 'Samsung Browser';
      }
      
      // Check if browser supports notifications
      const supportsNotifications = 'Notification' in window;
      
      // Check if app is installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      setDeviceInfo({
        type: deviceType,
        os,
        browser,
        supportsNotifications,
        isStandalone,
        isiOS: os === 'ios',
        isiPad: isIPad,
        isAndroid: os === 'android'
      });
      
      setLoading(false);
    };

    detectDevice();
    
    // Re-detect when visibility changes (helps with PWA detection after install)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        detectDevice();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    deviceInfo,
    loading,
    isIOS: deviceInfo?.os === 'ios',
    isAndroid: deviceInfo?.os === 'android', 
    isMobile: deviceInfo?.type === 'mobile' || deviceInfo?.type === 'tablet',
    isPWA: deviceInfo?.isStandalone || false,
    supportsNotifications: deviceInfo?.supportsNotifications || false
  };
}
