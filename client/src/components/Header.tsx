import { Heart, Sun, Moon, MoreVertical, List, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { wishlistItems, gridView, setGridView } = useWishlist();

  const getGridIcon = (view: string) => {
    switch (view) {
      case 'list': return <List className="w-4 h-4" />;
      case 'grid-2': return <LayoutGrid className="w-4 h-4" />;
      case 'grid-3': return <Grid3X3 className="w-4 h-4" />;
      default: return <List className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition sticky top-0 z-40" data-testid="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buked List</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="item-count">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 theme-transition">
              {(['list', 'grid-2', 'grid-3'] as const).map((view) => (
                <Button
                  key={view}
                  variant="ghost"
                  size="sm"
                  onClick={() => setGridView(view)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    gridView === view
                      ? 'bg-white dark:bg-slate-600 text-primary-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                  }`}
                  data-testid={`button-view-${view}`}
                >
                  {getGridIcon(view)}
                </Button>
              ))}
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-all theme-transition"
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-all theme-transition"
              data-testid="button-menu"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
