"use client"

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function AffiliateTracker() {
  const searchParams = useSearchParams();
  const affSlug = searchParams.get('aff');

  useEffect(() => {
    if (affSlug) {
      // Track the click
      trackAffiliateClick(affSlug);

      // Store affiliate info in BOTH session and local storage for conversion tracking
      sessionStorage.setItem('affiliateSlug', affSlug);
      sessionStorage.setItem('affiliateTimestamp', Date.now().toString());

      // ALSO store in localStorage for checkout page
      localStorage.setItem('affiliateSlug', affSlug);
      localStorage.setItem('affiliateTimestamp', Date.now().toString());
    }
  }, [affSlug]);

  const trackAffiliateClick = async (slug: string) => {
    try {
      await fetch(`/api/affiliate-links/${slug}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'click'
        }),
      });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}

// Function to track conversions (call this when an order is completed)
export const trackAffiliateConversion = async (orderId: string, orderValue: number) => {
  // Try both sessionStorage and localStorage
  const affiliateSlug = sessionStorage.getItem('affiliateSlug') || localStorage.getItem('affiliateSlug');
  const affiliateTimestamp = sessionStorage.getItem('affiliateTimestamp') || localStorage.getItem('affiliateTimestamp');

  if (!affiliateSlug || !affiliateTimestamp) {
    return;
  }

  // Check if the affiliate click is still valid (within 30 days)
  const clickTime = parseInt(affiliateTimestamp);
  const now = Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

  if (now - clickTime > thirtyDaysInMs) {
    // Clear expired affiliate data from both storages
    sessionStorage.removeItem('affiliateSlug');
    sessionStorage.removeItem('affiliateTimestamp');
    localStorage.removeItem('affiliateSlug');
    localStorage.removeItem('affiliateTimestamp');
    return;
  }

  try {
    await fetch(`/api/affiliate-links/${affiliateSlug}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'conversion',
        orderId,
        orderValue
      }),
    });

    // Clear affiliate data after successful conversion
    sessionStorage.removeItem('affiliateSlug');
    sessionStorage.removeItem('affiliateTimestamp');
  } catch (error) {
    console.error('Error tracking affiliate conversion:', error);
  }
};
