import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: number | null;
  onSubmit: (data: { categoryId: number; name: string; description?: string }) => void;
  isLoading: boolean;
}

export default function CreateUtilityDialog({
  open,
  onOpenChange,
  categoryId,
  onSubmit,
  isLoading,
}: CreateUtilityDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    onSubmit({
      categoryId,
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Utilitate Nouă</DialogTitle>
          <DialogDescription>
            Completează formularul pentru a adăuga o nouă utilitate în această categorie.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utility-name">Nume Utilitate</Label>
            <Input
              id="utility-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Curent electric, Gaz..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="utility-description">Descriere (opțional)</Label>
            <Textarea
              id="utility-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalii suplimentare despre utilitate..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Se creează...' : 'Creează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
