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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  } | null;
  onSubmit: (data: { categoryId: number; name: string; color: string; icon: string }) => void;
  isLoading: boolean;
}

export default function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: EditCategoryDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon);
    } else {
      setName('');
      setColor('');
      setIcon('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !color || !icon || !category) return;

    onSubmit({
      categoryId: category.id,
      name: name.trim(),
      color,
      icon,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editează Categoria</DialogTitle>
          <DialogDescription>
            Modifică informațiile despre această categorie.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nume Categorie</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Utilități, Servicii..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color">Culoare</Label>
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
            <Label htmlFor="edit-icon">Iconiță</Label>
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
              disabled={isLoading || !name.trim() || !color || !icon}
            >
              {isLoading ? 'Se salvează...' : 'Salvează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
