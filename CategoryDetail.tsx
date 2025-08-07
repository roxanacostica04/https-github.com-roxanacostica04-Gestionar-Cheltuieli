import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import backend from '~backend/client';
import type { UtilityWithTransactions } from '~backend/expense/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, DollarSign, CreditCard, Zap, Calculator, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CreateTransactionDialog from '../components/CreateTransactionDialog';
import InstallmentPaymentDialog from '../components/InstallmentPaymentDialog';
import ConsumptionReadingDialog from '../components/ConsumptionReadingDialog';
import AnnualPaymentDialog from '../components/AnnualPaymentDialog';
import EditUtilityDialog from '../components/EditUtilityDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const utilityTypeLabels = {
  simple: 'Simplu',
  installment: 'Rate fixe',
  bank_installment: 'Rate bancă',
  consumption: 'Consum',
  annual_payment: 'Plată anuală',
};

const utilityTypeIcons = {
  simple: DollarSign,
  installment: CreditCard,
  bank_installment: CreditCard,
  consumption: Zap,
  annual_payment: Calendar,
};

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [installmentPaymentOpen, setInstallmentPaymentOpen] = useState(false);
  const [consumptionReadingOpen, setConsumptionReadingOpen] = useState(false);
  const [annualPaymentOpen, setAnnualPaymentOpen] = useState(false);
  const [editUtilityOpen, setEditUtilityOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUtilityId, setSelectedUtilityId] = useState<number | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<UtilityWithTransactions | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: utilitiesData, isLoading } = useQuery({
    queryKey: ['utilities', categoryId],
    queryFn: () => backend.expense.listUtilities({ categoryId: parseInt(categoryId!) }),
    enabled: !!categoryId,
  });

  const createTransactionMutation = useMutation({
    mutationFn: backend.expense.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities', categoryId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setCreateTransactionOpen(false);
      toast({
        title: "Succes",
        description: "Tranzacția a fost creată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea tranzacția.",
        variant: "destructive",
      });
    },
  });

  const updateUtilityMutation = useMutation({
    mutationFn: backend.expense.updateUtility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities', categoryId] });
      setEditUtilityOpen(false);
      toast({
        title: "Succes",
        description: "Utilitatea a fost actualizată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error updating utility:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza utilitatea.",
        variant: "destructive",
      });
    },
  });

  const deleteUtilityMutation = useMutation({
    mutationFn: backend.expense.deleteUtility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities', categoryId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeleteConfirmOpen(false);
      toast({
        title: "Succes",
        description: "Utilitatea a fost ștearsă cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting utility:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge utilitatea.",
        variant: "destructive",
      });
    },
  });

  const handleUtilityAction = (utility: UtilityWithTransactions) => {
    setSelectedUtilityId(utility.id);
    
    switch (utility.utilityType) {
      case 'simple':
        setCreateTransactionOpen(true);
        break;
      case 'installment':
      case 'bank_installment':
        setInstallmentPaymentOpen(true);
        break;
      case 'consumption':
        setConsumptionReadingOpen(true);
        break;
      case 'annual_payment':
        setAnnualPaymentOpen(true);
        break;
    }
  };

  const handleEditUtility = (utility: UtilityWithTransactions) => {
    setSelectedUtility(utility);
    setEditUtilityOpen(true);
  };

  const handleDeleteUtility = (utility: UtilityWithTransactions) => {
    setSelectedUtility(utility);
    setDeleteConfirmOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ro-RO').format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Categorii
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const utilities = utilitiesData?.utilities || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/categories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Categorii
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Utilități</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {utilities.map((utility: UtilityWithTransactions) => {
          const TypeIcon = utilityTypeIcons[utility.utilityType as keyof typeof utilityTypeIcons] || DollarSign;
          
          return (
            <Card 
              key={utility.id} 
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 border border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-gray-50/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg">{utility.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUtility(utility)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUtility(utility)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={utility.totalAmount > 0 ? "default" : "secondary"} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {formatCurrency(utility.totalAmount)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      {utilityTypeLabels[utility.utilityType as keyof typeof utilityTypeLabels]}
                    </Badge>
                  </div>
                  {utility.description && (
                    <p className="text-sm text-gray-600">{utility.description}</p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tranzacții:</span>
                    <span className="font-medium">{utility.transactions.length}</span>
                  </div>
                  
                  {utility.transactions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Ultima tranzacție:</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(utility.transactions[0].date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className={utility.transactions[0].type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {utility.transactions[0].type === 'income' ? '+' : '-'}
                            {formatCurrency(utility.transactions[0].amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUtilityAction(utility)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {utility.utilityType === 'simple' && 'Adaugă Tranzacție'}
                    {utility.utilityType === 'installment' && 'Configurează Rate'}
                    {utility.utilityType === 'bank_installment' && 'Configurează Rate'}
                    {utility.utilityType === 'consumption' && 'Adaugă Citire'}
                    {utility.utilityType === 'annual_payment' && 'Adaugă Plată'}
                  </Button>
                  
                  {(utility.utilityType === 'installment' || utility.utilityType === 'bank_installment') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to installments view
                        window.location.href = `/utilities/${utility.id}/installments`;
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Calculator className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {utility.utilityType === 'consumption' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to consumption view
                        window.location.href = `/utilities/${utility.id}/consumption`;
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {utilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nu există utilități în această categorie.</p>
          <Button asChild>
            <Link to="/categories">
              Înapoi la Categorii
            </Link>
          </Button>
        </div>
      )}

      <CreateTransactionDialog
        open={createTransactionOpen}
        onOpenChange={setCreateTransactionOpen}
        utilityId={selectedUtilityId}
        onSubmit={(data) => createTransactionMutation.mutate(data)}
        isLoading={createTransactionMutation.isPending}
      />

      <InstallmentPaymentDialog
        open={installmentPaymentOpen}
        onOpenChange={setInstallmentPaymentOpen}
        utilityId={selectedUtilityId}
      />

      <ConsumptionReadingDialog
        open={consumptionReadingOpen}
        onOpenChange={setConsumptionReadingOpen}
        utilityId={selectedUtilityId}
      />

      <AnnualPaymentDialog
        open={annualPaymentOpen}
        onOpenChange={setAnnualPaymentOpen}
        utilityId={selectedUtilityId}
      />

      <EditUtilityDialog
        open={editUtilityOpen}
        onOpenChange={setEditUtilityOpen}
        utility={selectedUtility}
        onSubmit={(data) => updateUtilityMutation.mutate(data)}
        isLoading={updateUtilityMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Șterge Utilitatea"
        description={`Ești sigur că vrei să ștergi utilitatea "${selectedUtility?.name}"? Această acțiune va șterge definitiv toate datele asociate (tranzacții, rate, citiri, etc.) și nu poate fi anulată.`}
        onConfirm={() => selectedUtility && deleteUtilityMutation.mutate({ utilityId: selectedUtility.id })}
        isLoading={deleteUtilityMutation.isPending}
      />
    </div>
  );
}
