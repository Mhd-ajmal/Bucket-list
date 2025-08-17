import Dexie, { Table } from 'dexie';
import { Category, WishlistItem, AppSettings } from '@shared/schema';

export class BukedListDB extends Dexie {
  categories!: Table<Category>;
  wishlistItems!: Table<WishlistItem>;
  appSettings!: Table<AppSettings>;

  constructor() {
    super('BukedListDB');
    
    this.version(1).stores({
      categories: '++id, name, isDefault, createdAt',
      wishlistItems: '++id, title, categoryId, createdAt, order',
      appSettings: '++theme, gridView, selectedCategoryId'
    });

    this.on('ready', () => {
      return this.initializeDefaultData();
    });
  }

  private async initializeDefaultData() {
    // Check if default categories exist
    const categoriesCount = await this.categories.count();
    if (categoriesCount === 0) {
      await this.categories.bulkAdd([
        {
          id: 'electronics',
          name: 'Electronics',
          emoji: '📱',
          isDefault: true,
          createdAt: new Date()
        },
        {
          id: 'fashion',
          name: 'Fashion',
          emoji: '👗',
          isDefault: true,
          createdAt: new Date()
        },
        {
          id: 'home',
          name: 'Home & Garden',
          emoji: '🏠',
          isDefault: true,
          createdAt: new Date()
        },
        {
          id: 'books',
          name: 'Books',
          emoji: '📚',
          isDefault: true,
          createdAt: new Date()
        }
      ]);
    }

    // Initialize default settings
    const settingsCount = await this.appSettings.count();
    if (settingsCount === 0) {
      await this.appSettings.add({
        theme: 'light',
        gridView: 'list',
        selectedCategoryId: undefined
      });
    }
  }

  async exportData(): Promise<string> {
    const categories = await this.categories.toArray();
    const wishlistItems = await this.wishlistItems.toArray();
    const appSettings = await this.appSettings.toArray();

    // Convert image blobs to base64 for export
    const itemsWithImages = await Promise.all(
      wishlistItems.map(async (item) => {
        if (item.imageBlob) {
          const base64 = await this.blobToBase64(item.imageBlob);
          return { ...item, imageBlob: undefined, imageBase64: base64 };
        }
        return item;
      })
    );

    const exportData = {
      categories,
      wishlistItems: itemsWithImages,
      appSettings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.transaction('rw', [this.categories, this.wishlistItems, this.appSettings], async () => {
        await this.categories.clear();
        await this.wishlistItems.clear();
        await this.appSettings.clear();

        // Import categories
        if (data.categories) {
          await this.categories.bulkAdd(data.categories);
        }

        // Import wishlist items with image conversion
        if (data.wishlistItems) {
          const itemsWithBlobs = await Promise.all(
            data.wishlistItems.map(async (item: any) => {
              if (item.imageBase64) {
                const blob = await this.base64ToBlob(item.imageBase64);
                return { ...item, imageBlob: blob, imageBase64: undefined };
              }
              return item;
            })
          );
          await this.wishlistItems.bulkAdd(itemsWithBlobs);
        }

        // Import settings
        if (data.appSettings) {
          await this.appSettings.bulkAdd(data.appSettings);
        }
      });
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string): Promise<Blob> {
    return fetch(base64).then(res => res.blob());
  }
}

export const db = new BukedListDB();
