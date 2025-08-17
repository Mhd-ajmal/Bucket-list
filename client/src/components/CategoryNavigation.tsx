import { Settings } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryNavigationProps {
  onManageCategories: () => void;
}

export function CategoryNavigation({ onManageCategories }: CategoryNavigationProps) {
  const { categories, wishlistItems, selectedCategory, setSelectedCategory } = useWishlist();

  const getCategoryItemCount = (categoryId?: string) => {
    if (!categoryId) {
      return wishlistItems.length;
    }
    return wishlistItems.filter(item => item.categoryId === categoryId).length;
  };

  const allItemsCount = wishlistItems.length;

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition" data-testid="category-navigation">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageCategories}
            className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center space-x-1 transition-colors"
            data-testid="button-manage-categories"
          >
            <Settings className="w-3 h-3" />
            <span>Manage</span>
          </Button>
        </div>
        
        <div className="category-scroll overflow-x-auto" data-testid="category-scroll">
          <div className="flex space-x-3 pb-2">
            {/* All Items */}
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(undefined)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                selectedCategory === undefined
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition'
              }`}
              data-testid="category-button-all"
            >
              <span>🌟</span>
              <span>All Items</span>
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === undefined
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-slate-600'
                }`}
                data-testid="category-count-all"
              >
                {allItemsCount}
              </Badge>
            </Button>
            
            {/* Category Pills */}
            {categories.map((category) => {
              const itemCount = getCategoryItemCount(category.id);
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition'
                  }`}
                  data-testid={`category-button-${category.id}`}
                >
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                    data-testid={`category-count-${category.id}`}
                  >
                    {itemCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
