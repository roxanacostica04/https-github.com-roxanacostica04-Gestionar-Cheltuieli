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

interface InstallmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: number | null;
}

const bankInstallmentOptions = [1, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20];

export default function InstallmentPaymentDialog({
  open,
  onOpenChange,
  utilityId,
}: InstallmentPaymentDialogProps) {
  const [totalAmount, setTotalAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInstallmentMutation = useMutation({
    mutationFn: backend.expense.createInstallmentPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onOpenChange(false);
      toast({
        title: "Succes",
        description: "Ratele au fost configurate cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating installment payment:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut configura ratele.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!open) {
      setTotalAmount('');
      setInstallments('');
      setDescription('');
      setStartDate(new Date());
      setShowCalendar(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount.trim() || !installments || !utilityId) return;

    const numericAmount = parseFloat(totalAmount);
    const numericInstallments = parseInt(installments);
    
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (isNaN(numericInstallments) || numericInstallments <= 0) return;

    createInstallmentMutation.mutate({
      utilityId,
      totalAmount: numericAmount,
      installments: numericInstallments,
      startDate,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configurează Plata în Rate</DialogTitle>
          <DialogDescription>
            Setează detaliile pentru plata în rate a acestei utilități.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="total-amount">Suma Totală (RON)</Label>
              <Input
                id="total-amount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="1000.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Numărul de Rate</Label>
              <Select value={installments} onValueChange={setInstallments} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează numărul de rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 rate (CASCO - la 4 luni)</SelectItem>
                  {bankInstallmentOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} {option === 1 ? 'rată' : 'rate'} (Bancă)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Primei Rate</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={startDate.toLocaleDateString('ro-RO')}
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
              <Label htmlFor="installment-description">Descriere (opțional)</Label>
              <Textarea
                id="installment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: iPhone 15 Pro, Asigurare CASCO..."
                rows={3}
              />
            </div>

            {totalAmount && installments && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Suma per rată:</strong> {' '}
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format(parseFloat(totalAmount) / parseInt(installments || '1'))}
                </p>
              </div>
            )}

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
                disabled={createInstallmentMutation.isPending || !totalAmount.trim() || !installments}
              >
                {createInstallmentMutation.isPending ? 'Se configurează...' : 'Configurează Rate'}
              </Button>
            </div>
          </form>

          {/* Calendar Section */}
          <div className={`${showCalendar ? 'block' : 'hidden lg:block'}`}>
            <DatePickerCalendar
              selectedDate={startDate}
              onDateSelect={setStartDate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
