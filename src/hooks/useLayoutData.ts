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
        const data = await LayoutService.getLayoutData();
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
