import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { WishlistItem as WishlistItemType } from '@shared/schema';
import { Header } from '@/components/Header';
import { CategoryNavigation } from '@/components/CategoryNavigation';
import { WishlistItem } from '@/components/WishlistItem';
import { AddItemModal } from '@/components/AddItemModal';
import { CategoryManager } from '@/components/CategoryManager';
import { MenuModal } from '@/components/MenuModal';
import { Button } from '@/components/ui/button';

export function Home() {
  const { wishlistItems, gridView } = useWishlist();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItemType | null>(null);

  const handleEditItem = (item: WishlistItemType) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setEditingItem(null);
    setShowAddModal(false);
  };

  const getGridClasses = () => {
    switch (gridView) {
      case 'list':
        return 'grid gap-6 grid-animation grid-cols-1';
      case 'grid-2':
        return 'grid gap-6 grid-animation grid-cols-1 sm:grid-cols-2';
      case 'grid-3':
        return 'grid gap-6 grid-animation grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid gap-6 grid-animation grid-cols-1';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" data-testid="home-page">
      <Header onMenuClick={() => setShowMenuModal(true)} />
      
      <CategoryNavigation onManageCategories={() => setShowCategoryManager(true)} />

      <main className="container mx-auto px-4 py-6">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-state">
            <div className="max-w-sm mx-auto">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 theme-transition">
                <div className="text-4xl text-gray-400 dark:text-gray-500">💝</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Start adding items you want to remember or buy later.
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                data-testid="button-add-first-item"
              >
                Add Your First Item
              </Button>
            </div>
          </div>
        ) : (
          <div className={getGridClasses()} data-testid="items-grid">
            {wishlistItems.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onEdit={handleEditItem}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white w-16 h-16 rounded-full shadow-lg fab-shadow hover:shadow-xl transition-all bounce-gentle"
          data-testid="button-add-item-fab"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        editingItem={editingItem}
      />

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      <MenuModal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
      />
    </div>
  );
}
