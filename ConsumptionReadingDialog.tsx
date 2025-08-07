import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import DatePickerCalendar from './DatePickerCalendar';

interface ConsumptionReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: number | null;
}

export default function ConsumptionReadingDialog({
  open,
  onOpenChange,
  utilityId,
}: ConsumptionReadingDialogProps) {
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [readingDate, setReadingDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConsumptionMutation = useMutation({
    mutationFn: backend.expense.createConsumptionReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onOpenChange(false);
      toast({
        title: "Succes",
        description: "Citirea a fost înregistrată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating consumption reading:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut înregistra citirea.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!open) {
      setPreviousReading('');
      setCurrentReading('');
      setTotalAmount('');
      setDescription('');
      setReadingDate(new Date());
      setShowCalendar(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previousReading.trim() || !currentReading.trim() || !totalAmount.trim() || !utilityId) return;

    const numericPrevious = parseFloat(previousReading);
    const numericCurrent = parseFloat(currentReading);
    const numericAmount = parseFloat(totalAmount);
    
    if (isNaN(numericPrevious) || isNaN(numericCurrent) || isNaN(numericAmount)) return;
    if (numericCurrent < numericPrevious) {
      toast({
        title: "Eroare",
        description: "Indexul curent nu poate fi mai mic decât cel anterior.",
        variant: "destructive",
      });
      return;
    }

    createConsumptionMutation.mutate({
      utilityId,
      readingDate,
      previousReading: numericPrevious,
      currentReading: numericCurrent,
      totalAmount: numericAmount,
      description: description.trim() || undefined,
    });
  };

  const consumption = previousReading && currentReading ? 
    parseFloat(currentReading) - parseFloat(previousReading) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adaugă Citire Consum</DialogTitle>
          <DialogDescription>
            Înregistrează citirea contorului pentru această utilitate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previous-reading">Index Anterior</Label>
              <Input
                id="previous-reading"
                type="number"
                step="0.001"
                min="0"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                placeholder="Ex: 1250.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-reading">Index Curent</Label>
              <Input
                id="current-reading"
                type="number"
                step="0.001"
                min="0"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                placeholder="Ex: 1350.2"
                required
              />
            </div>

            {consumption > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Consum:</strong> {consumption.toFixed(3)} unități
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="total-amount">Suma Totală Plătită (RON)</Label>
              <Input
                id="total-amount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="150.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data Citirii</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={readingDate.toLocaleDateString('ro-RO')}
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
              <Label htmlFor="consumption-description">Descriere (opțional)</Label>
              <Textarea
                id="consumption-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observații despre consum..."
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
                disabled={createConsumptionMutation.isPending || !previousReading.trim() || !currentReading.trim() || !totalAmount.trim()}
              >
                {createConsumptionMutation.isPending ? 'Se înregistrează...' : 'Înregistrează Citirea'}
              </Button>
            </div>
          </form>

          {/* Calendar Section */}
          <div className={`${showCalendar ? 'block' : 'hidden lg:block'}`}>
            <DatePickerCalendar
              selectedDate={readingDate}
              onDateSelect={setReadingDate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
