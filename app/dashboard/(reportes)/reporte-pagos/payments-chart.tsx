// components/PaymentsChart.tsx
'use client';

import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { useReportePagosStore } from '@/lib/store/reportes/reporte-pagos.store';

export default function PaymentsChart() {
  const {
    paymentsByDay,
    isLoading,
    error,
    fetchPaymentsByDay,
    setDateRange
  } = useReportePagosStore();

  const [localDateFrom, setLocalDateFrom] = useState('');
  const [localDateTo, setLocalDateTo] = useState('');

  useEffect(() => {
    // Cargar datos del último mes por defecto
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

    const fromDate = lastWeek.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    setLocalDateFrom(fromDate);
    setLocalDateTo(toDate);
    fetchPaymentsByDay(fromDate, toDate);
  }, []);

  const handleFilter = () => {
    if (localDateFrom && localDateTo) {
      setDateRange(localDateFrom, localDateTo);
      fetchPaymentsByDay(localDateFrom, localDateTo);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para Recharts
  const chartData = paymentsByDay.map((item) => {
    const date = new Date(item.date);
    return {
      date: date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short'
      }),
      total: item.total,
      count: item.count,
      fullDate: item.date,
    };
  });

  const totalAmount = paymentsByDay.reduce((sum, item) => sum + item.total, 0);
  const totalCount = paymentsByDay.reduce((sum, item) => sum + item.count, 0);
  const avgPerDay = paymentsByDay.length > 0 ? totalAmount / paymentsByDay.length : 0;

  // Calcular pagos por método
  const paymentsByMethod = paymentsByDay.reduce((acc, day) => {
    day.payments.forEach(payment => {
      if (!acc[payment.method]) {
        acc[payment.method] = { count: 0, total: 0 };
      }
      acc[payment.method].count++;
      acc[payment.method].total += payment.amount;
    });
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <CardContent className="p-3">
            <p className="font-medium">{payload[0].payload.fullDate}</p>
            <p className="text-sm text-muted-foreground">
              Total: S/. {payload[0].value.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Cantidad: {payload[0].payload.count} pago{payload[0].payload.count > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecciona el rango de fechas para analizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="date-from">Fecha desde</Label>
              <Input
                id="date-from"
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="date-to">Fecha hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter}>
              <Calendar className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En {paymentsByDay.length} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transacciones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Día</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {avgPerDay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por día con actividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días con Pagos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsByDay.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Días registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Registrados por Día</CardTitle>
          <CardDescription>
            Visualización de ingresos en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="line">Gráfica de Línea</TabsTrigger>
              <TabsTrigger value="bar">Gráfica de Barras</TabsTrigger>
            </TabsList>

            <TabsContent value="line" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => `S/. ${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Total (S/.)"
                    dot={{ fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="bar" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => `S/. ${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    name="Total (S/.)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Desglose por método de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Método de Pago</CardTitle>
          <CardDescription>
            Distribución de pagos según el método utilizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(paymentsByMethod).map(([method, data]) => (
              <Card key={method}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">
                      {method}
                    </CardTitle>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                      {data.count} pago{data.count > 1 ? 's' : ''}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    S/. {data.total.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((data.total / totalAmount) * 100).toFixed(1)}% del total
                  </p>
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(data.total / totalAmount) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}