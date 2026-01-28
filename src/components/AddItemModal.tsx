import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { WishlistItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currencies';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: WishlistItem | null;
}

export function AddItemModal({ isOpen, onClose, editingItem }: AddItemModalProps) {
  const { categories, addWishlistItem, updateWishlistItem, currency, updateSettings } = useWishlist();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    price: editingItem?.price?.toString() || '',
    notes: editingItem?.notes || '',
    categoryId: editingItem?.categoryId || (categories[0]?.id || ''),
    currency: currency,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingItem?.imageBlob ? URL.createObjectURL(editingItem.imageBlob) : editingItem?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageSelect(imageFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        notes: formData.notes.trim() || undefined,
        categoryId: formData.categoryId,
        imageBlob: selectedImage || undefined,
        imageUrl: !selectedImage && editingItem?.imageUrl ? editingItem.imageUrl : undefined,
      };

      if (editingItem) {
        await updateWishlistItem(editingItem.id, itemData);
        toast({
          title: "Item updated",
          description: "Your wishlist item has been updated successfully",
        });
      } else {
        await addWishlistItem(itemData);
        toast({
          title: "Item added",
          description: "Your item has been added to your wishlist",
        });
      }

      // Update global currency setting if changed
      if (formData.currency !== currency) {
        await updateSettings({ currency: formData.currency });
      }

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      notes: '',
      categoryId: categories[0]?.id || '',
      currency: currency,
    });
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  // Reset form when modal opens with editing item
  useState(() => {
    if (editingItem && isOpen) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description || '',
        price: editingItem.price?.toString() || '',
        notes: editingItem.notes || '',
        categoryId: editingItem.categoryId,
        currency: currency,
      });
      
      if (editingItem.imageBlob) {
        const url = URL.createObjectURL(editingItem.imageBlob);
        setImagePreview(url);
      } else if (editingItem.imageUrl) {
        setImagePreview(editingItem.imageUrl);
      }
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto" data-testid="add-item-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Image
            </Label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors theme-transition cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleImageUpload}
              data-testid="image-upload-area"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                    data-testid="image-preview"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="absolute top-2 right-2"
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag & drop an image or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                    data-testid="button-choose-file"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="file-input"
            />
          </div>
          
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter item title"
              required
              data-testid="input-title"
            />
          </div>
          
          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} data-testid={`category-option-${category.id}`}>
                    <div className="flex items-center space-x-2">
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Price */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price
            </Label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="pl-8"
                  placeholder="0.00"
                  data-testid="input-price"
                />
              </div>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-32" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} data-testid={`currency-option-${curr.code}`}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{curr.symbol}</span>
                        <span className="text-xs text-gray-500">{curr.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="resize-none"
              placeholder="Add a description..."
              data-testid="textarea-description"
            />
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="resize-none"
              placeholder="Personal notes..."
              data-testid="textarea-notes"
            />
          </div>
          
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
