import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import backend from '~backend/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Zap, Settings, TrendingUp, CreditCard, Play, Palette } from 'lucide-react';

const icons = [
  { name: 'Zap', component: Zap },
  { name: 'Settings', component: Settings },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Play', component: Play },
  { name: 'Palette', component: Palette },
];

const colors = [
  { name: 'blue', label: 'Albastru', class: 'bg-blue-500' },
  { name: 'green', label: 'Verde', class: 'bg-green-500' },
  { name: 'purple', label: 'Violet', class: 'bg-purple-500' },
  { name: 'red', label: 'Roșu', class: 'bg-red-500' },
  { name: 'yellow', label: 'Galben', class: 'bg-yellow-500' },
  { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { name: 'pink', label: 'Roz', class: 'bg-pink-500' },
  { name: 'gray', label: 'Gri', class: 'bg-gray-500' },
];

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: backend.expense.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onOpenChange(false);
      setName('');
      setColor('');
      setIcon('');
      toast({
        title: "Succes",
        description: "Categoria a fost creată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea categoria.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !color || !icon) {
      toast({
        title: "Eroare",
        description: "Toate câmpurile sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate({
      name: name.trim(),
      color,
      icon,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Categorie Nouă</DialogTitle>
          <DialogDescription>
            Completează formularul pentru a crea o nouă categorie de utilități.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume Categorie</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Utilități, Servicii..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Culoare</Label>
            <Select value={color} onValueChange={setColor} required>
              <SelectTrigger>
                <SelectValue placeholder="Selectează culoarea" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((colorOption) => (
                  <SelectItem key={colorOption.name} value={colorOption.name}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded ${colorOption.class}`} />
                      <span>{colorOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Iconiță</Label>
            <Select value={icon} onValueChange={setIcon} required>
              <SelectTrigger>
                <SelectValue placeholder="Selectează iconița" />
              </SelectTrigger>
              <SelectContent>
                {icons.map((iconOption) => {
                  const IconComponent = iconOption.component;
                  return (
                    <SelectItem key={iconOption.name} value={iconOption.name}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{iconOption.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? 'Se creează...' : 'Creează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
