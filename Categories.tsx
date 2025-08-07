import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBackend } from '../hooks/useBackend';
import type { CategoryWithUtilities } from '~backend/expense/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, Settings, TrendingUp, CreditCard, Play, Calendar, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CreateCategoryDialog from '../components/CreateCategoryDialog';
import CreateUtilityDialog from '../components/CreateUtilityDialog';
import EditCategoryDialog from '../components/EditCategoryDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import DatePickerCalendar from '../components/DatePickerCalendar';

const iconMap = {
  Zap,
  Settings,
  TrendingUp,
  CreditCard,
  Play,
};

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

const utilityTypeLabels = {
  simple: 'Simplu',
  installment: 'Rate fixe',
  bank_installment: 'Rate bancă',
  consumption: 'Consum',
  annual_payment: 'Plată anuală',
};

export default function Categories() {
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createUtilityOpen, setCreateUtilityOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithUtilities | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => backend.expense.listCategories(),
  });

  const createUtilityMutation = useMutation({
    mutationFn: backend.expense.createUtility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCreateUtilityOpen(false);
      toast({
        title: "Succes",
        description: "Utilitatea a fost creată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error creating utility:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea utilitatea.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: backend.expense.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditCategoryOpen(false);
      toast({
        title: "Succes",
        description: "Categoria a fost actualizată cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: backend.expense.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteCategoryOpen(false);
      toast({
        title: "Succes",
        description: "Categoria a fost ștearsă cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      const errorMessage = error.message.includes('existing utilities') 
        ? "Nu se poate șterge categoria care conține utilități. Șterge mai întâi toate utilitățile."
        : "Nu s-a putut șterge categoria.";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleAddUtility = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setCreateUtilityOpen(true);
  };

  const handleEditCategory = (category: CategoryWithUtilities) => {
    setSelectedCategory(category);
    setEditCategoryOpen(true);
  };

  const handleDeleteCategory = (category: CategoryWithUtilities) => {
    setSelectedCategory(category);
    setDeleteCategoryOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
          <div className="flex space-x-2">
            <Button disabled>
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button disabled>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Categorie
            </Button>
          </div>
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

  const categories = categoriesData?.categories || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCalendar(!showCalendar)}
            className={showCalendar ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button onClick={() => setCreateCategoryOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Categorie
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        {showCalendar && (
          <div className="lg:col-span-1">
            <DatePickerCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        )}

        {/* Categories Grid */}
        <div className={`${showCalendar ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: CategoryWithUtilities) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Settings;
              const colorClass = colorMap[category.color as keyof typeof colorMap] || 'bg-gray-500';

              return (
                <Card 
                  key={category.id} 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 border border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-gray-50/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass} text-white group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {category.utilities.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          title="Editează categoria"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Șterge categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 relative z-10">
                    <div className="space-y-2">
                      {category.utilities.slice(0, 3).map((utility) => (
                        <div key={utility.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{utility.name}</span>
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {utilityTypeLabels[utility.utilityType as keyof typeof utilityTypeLabels] || 'Simplu'}
                          </Badge>
                        </div>
                      ))}
                      {category.utilities.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{category.utilities.length - 3} mai multe utilități
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddUtility(category.id)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adaugă Utilitate
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                      >
                        <Link to={`/categories/${category.id}`}>
                          Vezi Detalii
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <CreateCategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />

      <CreateUtilityDialog
        open={createUtilityOpen}
        onOpenChange={setCreateUtilityOpen}
        categoryId={selectedCategoryId}
        onSubmit={(data) => createUtilityMutation.mutate(data)}
        isLoading={createUtilityMutation.isPending}
      />

      <EditCategoryDialog
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        category={selectedCategory}
        onSubmit={(data) => updateCategoryMutation.mutate(data)}
        isLoading={updateCategoryMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteCategoryOpen}
        onOpenChange={setDeleteCategoryOpen}
        title="Șterge Categoria"
        description={`Ești sigur că vrei să ștergi categoria "${selectedCategory?.name}"? Această acțiune va șterge definitiv categoria și nu poate fi anulată. Categoria trebuie să fie goală (fără utilități) pentru a putea fi ștearsă.`}
        onConfirm={() => selectedCategory && deleteCategoryMutation.mutate({ categoryId: selectedCategory.id })}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
