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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePickerCalendar from './DatePickerCalendar';

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: number | null;
  onSubmit: (data: {
    utilityId: number;
    type: 'income' | 'expense';
    amount: number;
    description?: string;
    date: Date;
  }) => void;
  isLoading: boolean;
}

export default function CreateTransactionDialog({
  open,
  onOpenChange,
  utilityId,
  onSubmit,
  isLoading,
}: CreateTransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!open) {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date());
      setShowCalendar(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !utilityId) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onSubmit({
      utilityId,
      type,
      amount: numericAmount,
      description: description.trim() || undefined,
      date,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adaugă Tranzacție Nouă</DialogTitle>
          <DialogDescription>
            Completează formularul pentru a adăuga o nouă tranzacție la această utilitate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Tip Tranzacție</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Cheltuială</SelectItem>
                  <SelectItem value="income">Venit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Sumă (RON)</Label>
              <Input
                id="transaction-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data Tranzacției</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={date.toLocaleDateString('ro-RO')}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  {showCalendar ? 'Ascunde' : 'Selectează'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-description">Descriere (opțional)</Label>
              <Textarea
                id="transaction-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalii despre tranzacție..."
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
                disabled={isLoading || !amount.trim()}
              >
                {isLoading ? 'Se creează...' : 'Creează'}
              </Button>
            </div>
          </form>

          {/* Calendar Section */}
          <div className={`${showCalendar ? 'block' : 'hidden lg:block'}`}>
            <DatePickerCalendar
              selectedDate={date}
              onDateSelect={setDate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
