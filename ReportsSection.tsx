import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

export default function ReportsSection() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [trendMonths, setTrendMonths] = useState(6);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Ianuarie' },
    { value: 2, label: 'Februarie' },
    { value: 3, label: 'Martie' },
    { value: 4, label: 'Aprilie' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Iunie' },
    { value: 7, label: 'Iulie' },
    { value: 8, label: 'August' },
    { value: 9, label: 'Septembrie' },
    { value: 10, label: 'Octombrie' },
    { value: 11, label: 'Noiembrie' },
    { value: 12, label: 'Decembrie' },
  ];

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-stats', selectedYear, selectedMonth],
    queryFn: () => backend.expense.getMonthlyStats({ year: selectedYear, month: selectedMonth }),
  });

  const { data: yearlyData } = useQuery({
    queryKey: ['yearly-comparison', selectedYear - 2, selectedYear],
    queryFn: () => backend.expense.getYearlyComparison({ 
      startYear: selectedYear - 2, 
      endYear: selectedYear 
    }),
  });

  const { data: categoryTrends } = useQuery({
    queryKey: ['category-trends', trendMonths],
    queryFn: () => backend.expense.getCategoryTrends({ months: trendMonths }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare monthly chart data
  const monthlyChartData = monthlyData?.stats.map(stat => ({
    month: months.find(m => m.value === stat.month)?.label || stat.month.toString(),
    venituri: stat.totalIncome,
    cheltuieli: stat.totalExpenses,
    sold: stat.balance,
  })) || [];

  // Prepare yearly chart data
  const yearlyChartData = yearlyData?.years.map(year => ({
    an: year.year.toString(),
    venituri: year.totalIncome,
    cheltuieli: year.totalExpenses,
    sold: year.balance,
  })) || [];

  // Prepare category pie chart data
  const currentMonthStats = selectedMonth 
    ? monthlyData?.stats.find(s => s.month === selectedMonth)
    : monthlyData?.stats[monthlyData.stats.length - 1];
  
  const categoryPieData = currentMonthStats?.categoryBreakdown.map((cat, index) => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    percentage: cat.percentage,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Rapoarte și Analize</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMonth?.toString() || "all"} onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Toate lunile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate lunile</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Yearly Trends Summary */}
      {yearlyData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Creștere Venituri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${yearlyData.trends.incomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearlyData.trends.incomeGrowth >= 0 ? '+' : ''}{formatPercent(yearlyData.trends.incomeGrowth)}
              </div>
              <p className="text-xs text-gray-500">față de anul trecut</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" />
                Creștere Cheltuieli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${yearlyData.trends.expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearlyData.trends.expenseGrowth >= 0 ? '+' : ''}{formatPercent(yearlyData.trends.expenseGrowth)}
              </div>
              <p className="text-xs text-gray-500">față de anul trecut</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Îmbunătățire Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${yearlyData.trends.balanceImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(yearlyData.trends.balanceImprovement)}
              </div>
              <p className="text-xs text-gray-500">față de anul trecut</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly/Yearly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            {selectedMonth ? `Analiza pentru ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : `Analiza anuală ${selectedYear}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedMonth ? [monthlyChartData.find(d => d.month === months.find(m => m.value === selectedMonth)?.label)] : monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedMonth ? "month" : "month"} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Perioada: ${label}`}
                />
                <Legend />
                <Bar dataKey="venituri" fill="#10B981" name="Venituri" />
                <Bar dataKey="cheltuieli" fill="#EF4444" name="Cheltuieli" />
                <Bar dataKey="sold" fill="#3B82F6" name="Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Comparison Chart */}
      {!selectedMonth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Comparație pe Ani
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="an" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Anul: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="venituri" stroke="#10B981" strokeWidth={3} name="Venituri" />
                  <Line type="monotone" dataKey="cheltuieli" stroke="#EF4444" strokeWidth={3} name="Cheltuieli" />
                  <Line type="monotone" dataKey="sold" stroke="#3B82F6" strokeWidth={3} name="Sold" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {categoryPieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2" />
                Distribuția Cheltuielilor pe Categorii
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Suma']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categorii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPieData.slice(0, 5).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(category.value)}</div>
                      <div className="text-sm text-gray-500">{formatPercent(category.percentage)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Trends */}
      {categoryTrends && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tendințe pe Categorii
              </CardTitle>
              <Select value={trendMonths.toString()} onValueChange={(value) => setTrendMonths(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Ultimele 3 luni</SelectItem>
                  <SelectItem value="6">Ultimele 6 luni</SelectItem>
                  <SelectItem value="12">Ultimul an</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTrends.categories.slice(0, 6).map((category) => (
                <div key={category.categoryId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.categoryName}</h4>
                    <Badge 
                      variant={
                        category.trend === 'increasing' ? 'destructive' : 
                        category.trend === 'decreasing' ? 'default' : 
                        'secondary'
                      }
                    >
                      {category.trend === 'increasing' && '↗ Creștere'}
                      {category.trend === 'decreasing' && '↘ Scădere'}
                      {category.trend === 'stable' && '→ Stabil'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-medium">{formatCurrency(category.totalAmount)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Medie lunară: <span className="font-medium">{formatCurrency(category.averageMonthly)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
