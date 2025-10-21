import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getLogs } from '@/lib/services/logService';
import { formatDateTime } from '@/lib/utils';
import {
  FileText,
  Filter,
  RefreshCw,
  LogIn,
  LogOut,
  Sprout,
  Package,
  PackagePlus,
  PackageCheck,
  PackageMinus,
  FileEdit,
  Trash2,
  Undo2,
  UserPlus,
  Building,
  Edit3,
  Plus,
} from 'lucide-react';

export function LogsViewer() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: logs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      try {
        console.log('Fetching logs...');
        const result = await getLogs({}, 100, 0);
        console.log('Logs fetched:', result?.length || 0);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Failed to load logs:', err);
        return [];
      }
    },
    retry: false,
  });

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.category?.toLowerCase().includes(search) ||
      log.action?.toLowerCase().includes(search) ||
      log.entity?.toLowerCase().includes(search) ||
      log.username?.toLowerCase().includes(search)
    );
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'system':
        return { variant: 'secondary', color: 'bg-gray-500' };
      case 'inventory':
        return { variant: 'default', color: 'bg-blue-500' };
      case 'issue':
        return { variant: 'warning', color: 'bg-amber-500' };
      case 'admin':
        return { variant: 'default', color: 'bg-purple-500' };
      case 'auth':
        return { variant: 'success', color: 'bg-green-500' };
      case 'error':
        return { variant: 'destructive', color: 'bg-red-500' };
      default:
        return { variant: 'secondary', color: 'bg-gray-400' };
    }
  };

  const getActionIcon = (action) => {
    if (!action) return FileText;

    // Specific actions first
    if (action === 'login') return LogIn;
    if (action === 'logout') return LogOut;
    if (action === 'seed' || action === 'create_first_admin') return Sprout;
    if (action === 'create_item') return Package;
    if (action === 'add_stock') return PackagePlus;
    if (action === 'remove_stock') return PackageMinus;
    if (action === 'create_issue') return PackageCheck;
    if (action === 'edit_issue') return FileEdit;
    if (action === 'delete_issue') return Trash2;
    if (action === 'return_item') return Undo2;
    if (action === 'create_worker') return UserPlus;
    if (action === 'create_department') return Building;
    if (action === 'update_worker') return Edit3;
    if (action === 'update_department') return Edit3;

    // Fallback patterns
    if (action.includes('create')) return Plus;
    if (action.includes('edit') || action.includes('update')) return Edit3;
    if (action.includes('delete')) return Trash2;
    if (action.includes('return')) return Undo2;

    return FileText;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Logovi sistema</CardTitle>
            <CardDescription>Pregled svih događaja i aktivnosti u sistemu</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Osveži
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="🔍 Pretraži logove..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium">Greška pri učitavanju logova</p>
            <p className="text-sm text-muted-foreground mb-4">{error?.message || 'Nepoznata greška'}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Pokušaj ponovo
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Učitavanje logova...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-lg border-2 border-dashed">
            <FileText className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-semibold mb-2">Nema logova</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Nisu pronađeni logovi za pretragu' : 'Nema dostupnih logova u sistemu'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Vreme</TableHead>
                  <TableHead className="font-semibold">Kategorija</TableHead>
                  <TableHead className="font-semibold">Akcija</TableHead>
                  <TableHead className="font-semibold">Entitet</TableHead>
                  <TableHead className="font-semibold">Korisnik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const categoryStyle = getCategoryColor(log.category || 'default');
                  const Icon = getActionIcon(log.action);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap font-mono">
                        {log.created_at ? formatDateTime(log.created_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${categoryStyle.color}`}></div>
                          <Badge variant={categoryStyle.variant}>{log.category || 'N/A'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{log.action || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <code className="px-2 py-1 bg-muted rounded text-xs">{log.entity || '-'}</code>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{log.username || 'System'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
