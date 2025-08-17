import { useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const { exportData, importData, clearAllData } = useWishlist();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `buked-list-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Your data has been exported successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      
      toast({
        title: "Import successful",
        description: "Your data has been imported successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import data. Please check the file format and try again.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        
        toast({
          title: "Data cleared",
          description: "All data has been cleared successfully",
        });
        
        onClose();
      } catch (error) {
        toast({
          title: "Clear failed",
          description: "Failed to clear data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm" data-testid="menu-modal">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={handleExportData}
            className="w-full justify-start px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3"
            data-testid="button-export-data"
          >
            <Download className="w-4 h-4 text-primary-500" />
            <span className="text-gray-900 dark:text-white">Export Data</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleImportData}
            className="w-full justify-start px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3"
            data-testid="button-import-data"
          >
            <Upload className="w-4 h-4 text-primary-500" />
            <span className="text-gray-900 dark:text-white">Import Data</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleClearAllData}
            className="w-full justify-start px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3"
            data-testid="button-clear-data"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-gray-900 dark:text-white">Clear All Data</span>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            data-testid="button-close-menu"
          >
            Close
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
          data-testid="file-import-input"
        />
      </DialogContent>
    </Dialog>
  );
}
