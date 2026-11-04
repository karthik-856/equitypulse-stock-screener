import { useState, useEffect, useCallback } from 'react';
import { Stock } from '@/types/stock';
import { generateMockStocks } from '@/lib/mockDataGenerator';
import { saveStocksToOfflineStorage, getStocksFromOfflineStorage } from '@/lib/offlineStorage';

export function useStockData() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Online / Offline detection
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOffline(!online);

    if (!online) {
      try {
        const offlineData = await getStocksFromOfflineStorage();
        if (offlineData.length > 0) {
          setStocks(offlineData);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load from offline cache, generating fallback universe');
      }
    }

    try {
      const res = await fetch('/api/stocks?pageSize=5000');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStocks(json.data);
        // Background cache into IndexedDB
        saveStocksToOfflineStorage(json.data);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      // Fallback: Generate 5,000 stocks locally in browser
      console.warn('API fetch failed, generating client-side universe:', err.message);
      const fallback = generateMockStocks(5000);
      setStocks(fallback);
      saveStocksToOfflineStorage(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOffline(false);
      loadData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  return { stocks, setStocks, isLoading, error, isOffline, refetch: loadData };
}
