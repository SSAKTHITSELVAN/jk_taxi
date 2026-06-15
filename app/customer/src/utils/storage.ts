/**
 * Production-grade storage utility with fallback
 * Handles AsyncStorage errors gracefully
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback storage
const memoryStorage: { [key: string]: string } = {};

let isAsyncStorageAvailable = true;

// Test AsyncStorage availability
(async () => {
  try {
    await AsyncStorage.setItem('__test__', 'test');
    await AsyncStorage.removeItem('__test__');
    console.log('✅ AsyncStorage: Available');
  } catch (error) {
    isAsyncStorageAvailable = false;
    console.warn('⚠️  AsyncStorage: Not available, using memory fallback');
  }
})();

/**
 * Set item in storage (AsyncStorage or memory fallback)
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  if (isAsyncStorageAvailable) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.setItem failed for key "${key}", using memory fallback`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  memoryStorage[key] = value;
};

/**
 * Get item from storage (AsyncStorage or memory fallback)
 */
export const getItem = async (key: string): Promise<string | null> => {
  if (isAsyncStorageAvailable) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.getItem failed for key "${key}", using memory fallback`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  return memoryStorage[key] || null;
};

/**
 * Remove item from storage
 */
export const removeItem = async (key: string): Promise<void> => {
  if (isAsyncStorageAvailable) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.removeItem failed for key "${key}"`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  delete memoryStorage[key];
};

/**
 * Remove multiple items
 */
export const multiRemove = async (keys: string[]): Promise<void> => {
  if (isAsyncStorageAvailable) {
    try {
      await AsyncStorage.multiRemove(keys);
      return;
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.multiRemove failed`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  keys.forEach(key => delete memoryStorage[key]);
};

/**
 * Clear all storage
 */
export const clear = async (): Promise<void> => {
  if (isAsyncStorageAvailable) {
    try {
      await AsyncStorage.clear();
      return;
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.clear failed`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
};

/**
 * Get all keys
 */
export const getAllKeys = async (): Promise<string[]> => {
  if (isAsyncStorageAvailable) {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.warn(`⚠️  AsyncStorage.getAllKeys failed`);
      isAsyncStorageAvailable = false;
    }
  }

  // Fallback to memory
  return Object.keys(memoryStorage);
};

/**
 * Check if AsyncStorage is working
 */
export const isStorageAvailable = (): boolean => {
  return isAsyncStorageAvailable;
};

// Export default storage object
export default {
  setItem,
  getItem,
  removeItem,
  multiRemove,
  clear,
  getAllKeys,
  isStorageAvailable,
};
