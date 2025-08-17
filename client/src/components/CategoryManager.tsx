import { useState } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryFormData {
  name: string;
  emoji: string;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, wishlistItems, addCategory, updateCategory, deleteCategory } = useWishlist();
  const { toast } = useToast();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    emoji: '📁',
  });

  const getCategoryItemCount = (categoryId: string) => {
    return wishlistItems.filter(item => item.categoryId === categoryId).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast({
          title: "Category updated",
          description: "Category has been updated successfully",
        });
      } else {
        await addCategory(formData);
        toast({
          title: "Category added",
          description: "New category has been added successfully",
        });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (category: Category) => {
    const itemCount = getCategoryItemCount(category.id);
    
    let confirmMessage = `Are you sure you want to delete "${category.name}"?`;
    if (itemCount > 0) {
      confirmMessage += ` This will also delete ${itemCount} item${itemCount > 1 ? 's' : ''} in this category.`;
    }

    if (confirm(confirmMessage)) {
      try {
        await deleteCategory(category.id);
        toast({
          title: "Category deleted",
          description: "Category has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', emoji: '📁' });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Common emojis for quick selection
  const commonEmojis = [
    '📁', '📱', '👗', '🏠', '📚', '🎵', '🎮', '🍳', '🏃', '✈️',
    '🎨', '🔧', '💼', '🏥', '🚗', '🏖️', '🎓', '💡', '🎯', '🔥'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md max-h-[80vh] overflow-y-auto" data-testid="category-manager-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Categories
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-4" data-testid="category-form">
              <div>
                <Label htmlFor="category-name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </Label>
                <Input
                  id="category-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                  data-testid="input-category-name"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emoji Icon
                </Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                    className="w-16 text-center text-lg"
                    placeholder="📁"
                    data-testid="input-category-emoji"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Or click below to select
                  </span>
                </div>
                
                <div className="grid grid-cols-10 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                      className={`w-8 h-8 text-lg rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${
                        formData.emoji === emoji ? 'bg-primary-100 dark:bg-primary-900' : ''
                      }`}
                      data-testid={`emoji-${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                  data-testid="button-cancel-category"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                  data-testid="button-save-category"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((category) => {
              const itemCount = getCategoryItemCount(category.id);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg theme-transition"
                  data-testid={`category-item-${category.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl" data-testid={`category-emoji-${category.id}`}>
                      {category.emoji}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white" data-testid={`category-name-${category.id}`}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400" data-testid={`category-count-${category.id}`}>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="text-primary-500 hover:text-primary-600 p-2"
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-red-500 hover:text-red-600 p-2"
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              data-testid="button-add-category"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
