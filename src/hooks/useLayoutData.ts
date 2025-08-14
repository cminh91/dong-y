'use client';

import { useState, useEffect } from 'react';
import { LayoutData, LayoutService } from '@/lib/services/layout-service';

export function useLayoutData() {
  const [layoutData, setLayoutData] = useState<LayoutData>({
    productCategories: [],
    postCategories: [],
    contactInfo: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        setLoading(true);
        setError(null);
        // console.log('useLayoutData: Fetching layout data...');
        const data = await LayoutService.getLayoutData();
        // console.log('useLayoutData: Layout data received:', data);
        // console.log('useLayoutData: Post categories count:', data.postCategories?.length || 0);
        // console.log('useLayoutData: Product categories count:', data.productCategories?.length || 0);
        setLayoutData(data);
      } catch (err) {
        console.error('Error fetching layout data:', err);
        setError('Failed to load layout data');
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutData();
  }, []);

  return { layoutData, loading, error };
}
