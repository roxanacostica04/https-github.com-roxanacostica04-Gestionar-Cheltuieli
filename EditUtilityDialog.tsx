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

interface EditUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utility: {
    id: number;
    name: string;
    description?: string;
  } | null;
  onSubmit: (data: { utilityId: number; name: string; description?: string }) => void;
  isLoading: boolean;
}

export default function EditUtilityDialog({
  open,
  onOpenChange,
  utility,
  onSubmit,
  isLoading,
}: EditUtilityDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (utility) {
      setName(utility.name);
      setDescription(utility.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [utility]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !utility) return;

    onSubmit({
      utilityId: utility.id,
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editează Utilitatea</DialogTitle>
          <DialogDescription>
            Modifică informațiile despre această utilitate.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-utility-name">Nume Utilitate</Label>
            <Input
              id="edit-utility-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Curent electric, Gaz..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-utility-description">Descriere (opțional)</Label>
            <Textarea
              id="edit-utility-description"
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
              {isLoading ? 'Se salvează...' : 'Salvează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
