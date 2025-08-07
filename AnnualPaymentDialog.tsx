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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import DatePickerCalendar from './DatePickerCalendar';

interface AnnualPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: number | null;
}

const yearOptions = [1, 2, 3, 4];

export default function AnnualPaymentDialog({
  open,
  onOpenChange,
  utilityId,
}: AnnualPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [yearsValid, setYearsValid] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAnnualPaymentMutation = useMutation({
    mutationFn: backend.expense.createAnnualPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onOpenChange(false);
      toast({
        title: "Succes",
        description: "Plata anuală a fost înregistrată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating annual payment:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut înregistra plata anuală.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!open) {
      setAmount('');
      setYearsValid('');
      setDescription('');
      setPaymentDate(new Date());
      setShowCalendar(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !yearsValid || !utilityId) return;

    const numericAmount = parseFloat(amount);
    const numericYears = parseInt(yearsValid);
    
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (isNaN(numericYears) || numericYears <= 0) return;

    createAnnualPaymentMutation.mutate({
      utilityId,
      amount: numericAmount,
      paymentDate,
      yearsValid: numericYears,
      description: description.trim() || undefined,
    });
  };

  const getNextPaymentDate = () => {
    if (!yearsValid) return null;
    const nextDate = new Date(paymentDate);
    nextDate.setFullYear(nextDate.getFullYear() + parseInt(yearsValid));
    return nextDate.toLocaleDateString('ro-RO');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adaugă Plată Anuală</DialogTitle>
          <DialogDescription>
            Înregistrează o plată anuală cu notificare automată pentru reînnoire.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="annual-amount">Suma Plătită (RON)</Label>
              <Input
                id="annual-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years-valid">Valabilitate (ani)</Label>
              <Select value={yearsValid} onValueChange={setYearsValid} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează perioada" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((years) => (
                    <SelectItem key={years} value={years.toString()}>
                      {years} {years === 1 ? 'an' : 'ani'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Plății</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={paymentDate.toLocaleDateString('ro-RO')}
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

            {getNextPaymentDate() && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Următoarea plată:</strong> {getNextPaymentDate()}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Vei fi notificat cu 30 de zile înainte
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="annual-description">Descriere (opțional)</Label>
              <Textarea
                id="annual-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalii despre plată..."
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
                disabled={createAnnualPaymentMutation.isPending || !amount.trim() || !yearsValid}
              >
                {createAnnualPaymentMutation.isPending ? 'Se înregistrează...' : 'Înregistrează Plata'}
              </Button>
            </div>
          </form>

          {/* Calendar Section */}
          <div className={`${showCalendar ? 'block' : 'hidden lg:block'}`}>
            <DatePickerCalendar
              selectedDate={paymentDate}
              onDateSelect={setPaymentDate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
