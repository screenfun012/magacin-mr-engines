import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllItems } from '@/lib/services/inventoryService';
import { getAllWorkers, getAllDepartments } from '@/lib/services/workerService';
import { getMonthlyIssues } from '@/lib/services/issueService';
import { Package, Users, Building2, TrendingUp, BarChart3 } from 'lucide-react';
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

  const lowStockItems = items.filter((item) => item.qty_on_hand <= item.min_qty).length;
  const totalValue = items.reduce((sum, item) => sum + (item.qty_on_hand || 0), 0);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-brand-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno artikala</CardTitle>
            <div className="p-2 bg-brand-red/10 rounded-lg">
              <Package className="h-5 w-5 text-brand-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockItems > 0 && <span className="text-red-600 font-medium">{lowStockItems} ispod minimuma</span>}
              {lowStockItems === 0 && 'Sve na nivou'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Radnika</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktivnih radnika</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odeljenja</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktivnih odeljenja</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zaduženja</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issues.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktivnih zaduženja</p>
          </CardContent>
        </Card>
      </div>

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
              <div className="text-center py-12 text-muted-foreground">Nema podataka za prikaz</div>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Nema podataka za prikaz</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
