import { useState } from 'react';
import { GripVertical, Edit, Trash2, Calendar, StickyNote } from 'lucide-react';
import { WishlistItem as WishlistItemType } from '@shared/schema';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/lib/currencies';

interface WishlistItemProps {
  item: WishlistItemType;
  onEdit: (item: WishlistItemType) => void;
}

export function WishlistItem({ item, onEdit }: WishlistItemProps) {
  const { categories, deleteWishlistItem, currency } = useWishlist();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const category = categories.find(c => c.id === item.categoryId);
  
  // Handle image blob to URL conversion
  useState(() => {
    if (item.imageBlob) {
      const url = URL.createObjectURL(item.imageBlob);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (item.imageUrl) {
      setImageUrl(item.imageUrl);
    }
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteWishlistItem(item.id);
    }
  };

  const formattedPrice = formatPrice(item.price, currency);

  const noteCount = item.notes ? item.notes.split('\n').filter(line => line.trim()).length : 0;

  return (
    <div className="item-card bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all theme-transition group" data-testid={`wishlist-item-${item.id}`}>
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-48 object-cover rounded-t-xl"
            data-testid="item-image"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 dark:bg-slate-700 rounded-t-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-gray-400 dark:text-gray-500 mb-2">📷</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium" data-testid="item-category">
            {category && <span className="mr-1">{category.emoji}</span>}
            {category?.name || 'Uncategorized'}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="drag-handle bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              data-testid="button-drag"
            >
              <GripVertical className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              data-testid="button-edit-item"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              data-testid="button-delete-item"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2" data-testid="item-title">
            {item.title}
          </h3>
          {formattedPrice && (
            <span className="text-xl font-bold text-primary-500 ml-2" data-testid="item-price">
              {formattedPrice}
            </span>
          )}
        </div>
        
        {item.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2" data-testid="item-description">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3" />
            <span data-testid="item-date-added">
              Added {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
          </div>
          {noteCount > 0 && (
            <div className="flex items-center space-x-2">
              <StickyNote className="w-3 h-3" />
              <span data-testid="item-notes-count">
                {noteCount} {noteCount === 1 ? 'note' : 'notes'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
