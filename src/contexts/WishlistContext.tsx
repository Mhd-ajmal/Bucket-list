import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '@/lib/db';
import { Category, WishlistItem, AppSettings } from '@shared/schema';
import { useLiveQuery } from 'dexie-react-hooks';

interface WishlistContextType {
  categories: Category[];
  wishlistItems: WishlistItem[];
  settings: AppSettings | undefined;
  selectedCategory: string | undefined;
  gridView: 'list' | 'grid-2' | 'grid-3';
  currency: string;
  
  // Category methods
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Wishlist methods
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<void>;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  deleteWishlistItem: (id: string) => Promise<void>;
  reorderItems: (items: WishlistItem[]) => Promise<void>;
  
  // Settings methods
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setSelectedCategory: (categoryId: string | undefined) => void;
  setGridView: (view: 'list' | 'grid-2' | 'grid-3') => void;
  
  // Data methods
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategoryState] = useState<string | undefined>();
  const [gridView, setGridViewState] = useState<'list' | 'grid-2' | 'grid-3'>('list');
  const [currency, setCurrencyState] = useState<string>('USD');

  // Live queries
  const categories = useLiveQuery(() => db.categories.orderBy('createdAt').toArray()) || [];
  const allItems = useLiveQuery(() => db.wishlistItems.orderBy('order').toArray()) || [];
  const settings = useLiveQuery(() => db.appSettings.toCollection().first());

  // Filter items by selected category
  const wishlistItems = selectedCategory 
    ? allItems.filter(item => item.categoryId === selectedCategory)
    : allItems;

  // Initialize settings on load
  useEffect(() => {
    if (settings) {
      setSelectedCategoryState(settings.selectedCategoryId);
      setGridViewState(settings.gridView);
      setCurrencyState(settings.currency || 'USD');
    }
  }, [settings]);

  // Category methods
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>) => {
    const id = `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.categories.add({
      ...category,
      id,
      createdAt: new Date()
    });
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await db.categories.update(id, updates);
  };

  const deleteCategory = async (id: string) => {
    await db.transaction('rw', [db.categories, db.wishlistItems], async () => {
      // Delete category
      await db.categories.delete(id);
      
      // Delete or reassign items in this category
      const itemsInCategory = await db.wishlistItems.where('categoryId').equals(id).toArray();
      if (itemsInCategory.length > 0) {
        // For now, delete items. In the future, could show a dialog to reassign
        await db.wishlistItems.where('categoryId').equals(id).delete();
      }
    });
  };

  // Wishlist methods
  const addWishlistItem = async (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = await db.wishlistItems.orderBy('order').last();
    const order = (maxOrder?.order || 0) + 1;
    
    await db.wishlistItems.add({
      ...item,
      id,
      order,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const updateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
    await db.wishlistItems.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  };

  const deleteWishlistItem = async (id: string) => {
    await db.wishlistItems.delete(id);
  };

  const reorderItems = async (items: WishlistItem[]) => {
    await db.transaction('rw', db.wishlistItems, async () => {
      for (let i = 0; i < items.length; i++) {
        await db.wishlistItems.update(items[i].id, { order: i });
      }
    });
  };

  // Settings methods
  const updateSettings = async (updates: Partial<AppSettings>) => {
    const currentSettings = await db.appSettings.toCollection().first();
    if (currentSettings) {
      await db.appSettings.update(currentSettings.theme, updates);
    } else {
      await db.appSettings.add({ theme: 'light', gridView: 'list', currency: 'USD', ...updates });
    }
  };

  const setSelectedCategory = (categoryId: string | undefined) => {
    setSelectedCategoryState(categoryId);
    updateSettings({ selectedCategoryId: categoryId });
  };

  const setGridView = (view: 'list' | 'grid-2' | 'grid-3') => {
    setGridViewState(view);
    updateSettings({ gridView: view });
  };

  // Data methods
  const exportData = async () => {
    return await db.exportData();
  };

  const importData = async (jsonData: string) => {
    await db.importData(jsonData);
  };

  const clearAllData = async () => {
    await db.transaction('rw', [db.categories, db.wishlistItems, db.appSettings], async () => {
      await db.categories.clear();
      await db.wishlistItems.clear();
      await db.appSettings.clear();
    });
    
    // Reinitialize default data
    await db.open();
  };

  const value: WishlistContextType = {
    categories,
    wishlistItems,
    settings,
    selectedCategory,
    gridView,
    currency,
    addCategory,
    updateCategory,
    deleteCategory,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    reorderItems,
    updateSettings,
    setSelectedCategory,
    setGridView,
    exportData,
    importData,
    clearAllData,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
