import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UtilityLogoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: number | null;
  utilityName: string;
  currentLogoUrl?: string;
}

export default function UtilityLogoUpload({
  open,
  onOpenChange,
  utilityId,
  utilityName,
  currentLogoUrl,
}: UtilityLogoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ utilityId, fileName, fileData }: { utilityId: number; fileName: string; fileData: string }) => {
      return backend.expense.uploadUtilityLogo({ utilityId, fileName, fileData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast({
        title: "Succes",
        description: "Logo-ul a fost încărcat cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut încărca logo-ul.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (utilityId: number) => backend.expense.deleteUtilityLogo({ utilityId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      toast({
        title: "Succes",
        description: "Logo-ul a fost șters cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting logo:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge logo-ul.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Eroare",
        description: "Doar fișierele imagine sunt permise (JPEG, PNG, GIF, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Eroare",
        description: "Fișierul trebuie să fie mai mic de 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !utilityId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileData = e.target?.result as string;
      uploadMutation.mutate({
        utilityId,
        fileName: selectedFile.name,
        fileData,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDeleteLogo = () => {
    if (!utilityId) return;
    deleteMutation.mutate(utilityId);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logo pentru {utilityName}</DialogTitle>
          <DialogDescription>
            Încarcă un logo pentru această utilitate. Imaginea se va încadra automat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Logo Display */}
          {currentLogoUrl && !previewUrl && (
            <div className="space-y-2">
              <Label>Logo curent</Label>
              <div className="relative">
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <img
                    src={currentLogoUrl}
                    alt={`Logo ${utilityName}`}
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteLogo}
                  disabled={deleteMutation.isPending}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">
              {currentLogoUrl && !previewUrl ? 'Schimbă logo-ul' : 'Selectează logo'}
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Alege fișier
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Formate acceptate: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Previzualizare</Label>
              <div className="w-full h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
              <p className="text-xs text-gray-600">
                Imaginea se va încadra automat păstrând proporțiile
              </p>
            </div>
          )}

          {/* No Logo State */}
          {!currentLogoUrl && !previewUrl && (
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Niciun logo încărcat</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Anulează
            </Button>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Se încarcă...' : 'Încarcă Logo'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
