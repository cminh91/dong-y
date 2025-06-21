'use client';

import { useEffect } from 'react';

interface AffiliateTrackerProps {
  affiliateSlug?: string;
  referralCode?: string;
}

export default function AffiliateTracker({ affiliateSlug, referralCode }: AffiliateTrackerProps) {
  useEffect(() => {
    // Store affiliate tracking in localStorage for checkout
    if (affiliateSlug) {
      localStorage.setItem('affiliateSlug', affiliateSlug);
      console.log('Stored affiliate slug:', affiliateSlug);
    }
    
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
      console.log('Stored referral code:', referralCode);
    }

    // Set expiration (7 days)
    const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('affiliateExpiration', expirationTime.toString());

  }, [affiliateSlug, referralCode]);

  // Clean up expired affiliate tracking
  useEffect(() => {
    const checkExpiration = () => {
      const expiration = localStorage.getItem('affiliateExpiration');
      if (expiration && Date.now() > parseInt(expiration)) {
        localStorage.removeItem('affiliateSlug');
        localStorage.removeItem('referralCode');
        localStorage.removeItem('affiliateExpiration');
        console.log('Affiliate tracking expired and cleared');
      }
    };

    checkExpiration();
    // Check every hour
    const interval = setInterval(checkExpiration, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Show notification if affiliate tracking is active
  if (affiliateSlug || referralCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              Bạn đang xem sản phẩm thông qua liên kết giới thiệu. Cảm ơn bạn đã ủng hộ!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
