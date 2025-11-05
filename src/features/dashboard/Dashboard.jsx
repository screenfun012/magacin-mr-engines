import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/state/authStore';
import { getMonthlyIssues, updateIssueQty, deleteIssue, getIssueHistory } from '@/lib/services/issueService';
import { formatDate, formatDateTime, getMonthYearString } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { CalendarIcon, Edit2, Trash2, History, Package, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns'; // Samo za yearMonth format (yyyy-MM)
import { exportDashboardPDF, exportDashboardWord, exportDashboardExcel } from '@/lib/services/exportService';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [editingIssue, setEditingIssue] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const yearMonth = format(selectedMonth, 'yyyy-MM');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', yearMonth],
    queryFn: () => getMonthlyIssues(yearMonth),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // 30 sekundi - ne osvežava previše često
  });

  const updateMutation = useMutation({
    mutationFn: async ({ issueId, qty }) => {
      const result = await updateIssueQty(issueId, qty, user.id);
      if (!result.success) {
        throw new Error(result.error || 'Neuspešna izmena');
      }
      return result;
    },
    onMutate: async ({ issueId, qty }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['issues', yearMonth] });

      // Snapshot
      const previous = queryClient.getQueryData(['issues', yearMonth]);

      // Optimistic update
      queryClient.setQueryData(['issues', yearMonth], (old) =>
        old?.map((issue) => (issue.id === issueId ? { ...issue, qty } : issue))
      );

      // Close dialog immediately
      setEditingIssue(null);
      setEditQty('');

      return { previous };
    },
    onSuccess: () => {
      // Background refetch
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['issue-history'] });

      toast({
        variant: 'warning',
        title: 'Izmenjeno',
        description: 'Količina ažurirana',
      });
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(['issues', yearMonth], context.previous);
      }
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešna izmena',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (issueId) => {
      const result = await deleteIssue(issueId, user.id);
      if (!result.success) {
        throw new Error(result.error || 'Neuspešno brisanje');
      }
      return result;
    },
    onMutate: async (issueId) => {
      // Close dialog immediately
      setDeleteConfirm(null);

      await queryClient.cancelQueries({ queryKey: ['issues', yearMonth] });
      const previous = queryClient.getQueryData(['issues', yearMonth]);

      // Optimistically remove
      queryClient.setQueryData(['issues', yearMonth], (old) => old?.filter((issue) => issue.id !== issueId));

      return { previous };
    },
    onSuccess: () => {
      // Immediately invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });

      // Force immediate refetch to update stock
      queryClient.refetchQueries({ queryKey: ['items'], exact: false });
      queryClient.refetchQueries({ queryKey: ['issues'], exact: false });

      toast({
        variant: 'success',
        title: '✅ Razduženo',
        description: 'Zaduženje uklonjeno i roba vraćena u magacin',
      });
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues', yearMonth], context.previous);
      }
      toast({
        variant: 'destructive',
        title: '❌ Greška pri brisanju',
        description: error.message || 'Neuspešno brisanje zaduženja',
      });
    },
  });

  const handleEditClick = (issue) => {
    setEditingIssue(issue);
    setEditQty(issue.qty.toString());
  };

  const handleSaveEdit = () => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Unesite validnu količinu',
      });
      return;
    }

    updateMutation.mutate({ issueId: editingIssue.id, qty });
  };

  const handleDeleteClick = (issue) => {
    setDeleteConfirm(issue);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const filteredIssues = useMemo(() => {
    if (!debouncedSearch) return issues;
    const search = debouncedSearch.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.first_name?.toLowerCase().includes(search) ||
        issue.last_name?.toLowerCase().includes(search) ||
        issue.item_name?.toLowerCase().includes(search) ||
        issue.department_name?.toLowerCase().includes(search)
    );
  }, [issues, debouncedSearch]);

  const totalIssues = issues.length;
  const uniqueWorkers = new Set(issues.map((i) => i.worker_id)).size;
  const uniqueItems = new Set(issues.map((i) => i.item_id)).size;
  const isFetching = useIsFetching({ queryKey: ['issues', yearMonth] });

  const handleExport = async (format) => {
    setExporting(true);
    try {
      let result;
      if (format === 'pdf') {
        result = await exportDashboardPDF(issues, yearMonth, user);
      } else if (format === 'word') {
        result = await exportDashboardWord(issues, yearMonth, user);
      } else if (format === 'excel') {
        result = await exportDashboardExcel(issues, yearMonth, user);
      }

      if (result?.success) {
        toast({
          variant: 'default',
          title: 'Izveštaj izvezen',
          description: `Fajl sačuvan: ${result.filePath}`,
        });
        setShowExportDialog(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: result?.error || 'Neuspešan izvoz',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Greška pri izvozu',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {isFetching > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-red/10 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-brand-red rounded-full animate-ping"></div>
                <span className="text-xs font-medium text-brand-red">Ažuriranje...</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">Pregled zaduženja po radnicima • Automatsko osvežavanje</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Izvezi izveštaj
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getMonthYearString(selectedMonth)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno zaduženja</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Za izabrani mesec</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Radnika zaduženo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueWorkers}</div>
            <p className="text-xs text-muted-foreground">Različitih radnika</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artikala</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueItems}</div>
            <p className="text-xs text-muted-foreground">Različitih artikala</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Zaduženja po radnicima</CardTitle>
              <CardDescription>Prikaz svih aktivnih zaduženja za izabrani mesec</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Učitavanje zaduženja...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg border-2 border-dashed">
              <Package className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">Nema zaduženja</p>
              <p className="text-sm text-muted-foreground mb-4">Nema aktivnih zaduženja za izabrani mesec</p>
              <Button variant="outline" size="sm">
                Idi na Magacin
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Radnik</TableHead>
                    <TableHead className="font-semibold">Odeljenje</TableHead>
                    <TableHead className="font-semibold">Artikal</TableHead>
                    <TableHead className="font-semibold">Količina</TableHead>
                    <TableHead className="font-semibold">M.j.</TableHead>
                    <TableHead className="font-semibold">Datum zaduženja</TableHead>
                    <TableHead className="text-right font-semibold">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Izvezi izveštaj</DialogTitle>
            <DialogDescription>
              Izvezite zaduženja za mesec {getMonthYearString(selectedMonth)} u željenom formatu
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="h-20 flex items-center justify-start gap-3"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              <FileText className="h-8 w-8 text-brand-red" />
              <div className="flex-1 text-left">
                <div className="font-semibold">PDF dokument</div>
                <div className="text-sm text-muted-foreground">Memorandum format sa logotipom</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex items-center justify-start gap-3"
              onClick={() => handleExport('word')}
              disabled={exporting}
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Word dokument</div>
                <div className="text-sm text-muted-foreground">.docx format - uredivo</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex items-center justify-start gap-3"
              onClick={() => handleExport('excel')}
              disabled={exporting}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Excel tabela</div>
                <div className="text-sm text-muted-foreground">.xlsx sa grafikonima i statistikom</div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={exporting}>
              Otkaži
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingIssue} onOpenChange={() => setEditingIssue(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Izmeni količinu zaduženja</DialogTitle>
            <DialogDescription>
              Artikal: <span className="font-semibold">{editingIssue?.item_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-qty">Nova količina</Label>
              <Input
                id="edit-qty"
                type="number"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                placeholder="Unesite količinu"
                step="0.01"
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground">
                Trenutna količina: {editingIssue?.qty} {editingIssue?.uom}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIssue(null)}>
              Otkaži
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Potvrda brisanja zaduženja</DialogTitle>
            <DialogDescription className="pt-2">
              Brisanje zaduženja za:
              <br />
              <span className="font-semibold">
                {deleteConfirm?.first_name} {deleteConfirm?.last_name}
              </span>{' '}
              - {deleteConfirm?.item_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-amber-600 dark:text-amber-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Upozorenje</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Ova akcija će vratiti količinu ({deleteConfirm?.qty} {deleteConfirm?.uom}) u magacin i nije moguće
                    poništiti je.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Otkaži
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Brisanje...' : 'Potvrdi brisanje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IssueRow({ issue, onEdit, onDelete }) {
  const { data: history = [] } = useQuery({
    queryKey: ['issue-history', issue.id],
    queryFn: () => getIssueHistory(issue.id),
    refetchOnWindowFocus: false, // Ne osvežavaj automatski
    staleTime: 60000, // 1 minut
    enabled: true,
  });

  const hasHistory = history.length > 0;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {issue.first_name} {issue.last_name}
      </TableCell>
      <TableCell>{issue.department_name}</TableCell>
      <TableCell>{issue.item_name}</TableCell>
      <TableCell>
        {hasHistory ? (
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <button className="hover:opacity-80 transition-opacity">
                <span className="text-amber-600 dark:text-amber-500 font-bold cursor-help">{issue.qty}</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="top">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <History className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Istorija izmena</h4>
                    <p className="text-xs text-muted-foreground">{history.length} izmena</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((h, idx) => (
                    <div
                      key={h.id}
                      className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">{history.length - idx}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{h.username}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(h.changed_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-mono text-red-600 dark:text-red-400">{h.prev_qty}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono text-green-600 dark:text-green-400">{h.new_qty}</span>
                          <span className="text-xs text-muted-foreground">{issue.uom}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <span className="text-green-600 dark:text-green-500 font-bold">{issue.qty}</span>
        )}
      </TableCell>
      <TableCell>{issue.uom}</TableCell>
      <TableCell>{formatDate(issue.issued_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(issue)} className="h-8 w-8 p-0">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(issue)}
            className="h-8 w-8 p-0 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
