import { openDB, IDBPDatabase } from 'idb';
import { Stock } from '@/types/stock';

const DB_NAME = 'equitypulse-db';
const DB_VERSION = 1;
const STORE_NAME = 'stocks-universe';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in the browser'));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'symbol' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveStocksToOfflineStorage(stocks: Stock[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const stock of stocks) {
      await store.put(stock);
    }
    await tx.done;
  } catch (err) {
    console.warn('Failed to cache stocks offline:', err);
  }
}

export async function getStocksFromOfflineStorage(): Promise<Stock[]> {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  } catch (err) {
    console.warn('Failed to read stocks from offline cache:', err);
    return [];
  }
}
