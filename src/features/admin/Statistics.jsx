import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getAllItems } from '@/lib/services/inventoryService';
import { getAllWorkers, getAllDepartments } from '@/lib/services/workerService';
import { getMonthlyIssues } from '@/lib/services/issueService';
import {
  Package,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PackageCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  LineChart,
  Line,
} from 'recharts';

export function Statistics() {
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => getAllWorkers(),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getAllDepartments(),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: () => getMonthlyIssues(),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const lowStockItems = items.filter((item) => item.qty_on_hand <= item.min_qty);
  const criticalStockItems = items.filter((item) => item.qty_on_hand === 0);
  const goodStockItems = items.filter((item) => item.qty_on_hand > item.min_qty);
  const totalValue = items.reduce((sum, item) => sum + (item.qty_on_hand || 0), 0);
  const totalIssues = issues.length;
  const activeWorkers = workers.filter((w) => w.is_active).length;

  // Calculate stock health percentage
  const stockHealthPercentage = items.length > 0 ? Math.round((goodStockItems.length / items.length) * 100) : 100;

  // Issues by department
  const issuesByDept = issues.reduce((acc, issue) => {
    const dept = issue.department_name || 'Nepoznato';
    if (!acc[dept]) {
      acc[dept] = 0;
    }
    acc[dept] += issue.qty;
    return acc;
  }, {});

  const deptData = Object.entries(issuesByDept).map(([name, value]) => ({
    name,
    value,
  }));

  // Issues by item (top 10)
  const issuesByItem = issues.reduce((acc, issue) => {
    const itemName = issue.item_name || 'Nepoznato';
    if (!acc[itemName]) {
      acc[itemName] = 0;
    }
    acc[itemName] += issue.qty;
    return acc;
  }, {});

  const itemData = Object.entries(issuesByItem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, qty]) => ({
      name,
      qty,
    }));

  const COLORS = ['#DC2626', '#6B7280', '#000000', '#F97316', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Artikli Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno artikala</CardTitle>
            <div className="p-2.5 bg-brand-red/10 rounded-xl">
              <Package className="h-5 w-5 text-brand-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{items.length}</div>
            <div className="flex items-center gap-2 mt-2">
              {lowStockItems.length > 0 ? (
                <>
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {lowStockItems.length} kritično
                  </Badge>
                </>
              ) : (
                <Badge variant="success" className="text-xs bg-green-500/10 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Sve OK
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Radnici Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Radnici</CardTitle>
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{activeWorkers}</div>
            <p className="text-xs text-muted-foreground mt-2">Aktivnih u {departments.length} odeljenja</p>
          </CardContent>
        </Card>

        {/* Odeljenja Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odeljenja</CardTitle>
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Organizacione jedinice</p>
          </CardContent>
        </Card>

        {/* Zaduženja Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zaduženja</CardTitle>
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <PackageCheck className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalIssues}</div>
            <p className="text-xs text-muted-foreground mt-2">Aktivnih zaduženja</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Zdravlje magacina</CardTitle>
              <CardDescription>Pregled stanja zaliha po kategorijama</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {stockHealthPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Ukupno zdravlje zaliha</span>
              <span className="text-muted-foreground">
                {goodStockItems.length} / {items.length} artikala
              </span>
            </div>
            <Progress value={stockHealthPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Dobro stanje</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{goodStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Iznad minimuma</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm font-medium">Nisko stanje</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {lowStockItems.length - criticalStockItems.length}
              </div>
              <p className="text-xs text-muted-foreground">Na minimumu</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Kritično</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{criticalStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Bez zaliha</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zaduženja po odeljenjima</CardTitle>
            <CardDescription>Distribucija zaduženih artikala po odeljenjima</CardDescription>
          </CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nema podataka za prikaz</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 najzadužavanijih artikala</CardTitle>
            <CardDescription>Artikli sa najvećim brojem zaduženja</CardDescription>
          </CardHeader>
          <CardContent>
            {itemData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={itemData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="qty" fill="#DC2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nema podataka za prikaz</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Items List */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle>Artikli za hitno poručivanje</CardTitle>
            </div>
            <CardDescription>Artikli sa niskim stanjem ili bez zaliha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.qty_on_hand === 0 ? (
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {item.qty_on_hand} {item.uom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      min: {item.min_qty} {item.uom}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-center text-muted-foreground pt-2">
                  +{lowStockItems.length - 5} artikala više
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
