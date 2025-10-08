import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getAllWorkers, addWorker, updateWorker, toggleWorkerActive, getAllDepartments } from '@/lib/services/workerService';
import { UserPlus, Edit2, Power } from 'lucide-react';

export function WorkersManagement() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['workers', true],
    queryFn: () => getAllWorkers(true),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getAllDepartments(),
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department_id: '',
  });

  const addMutation = useMutation({
    mutationFn: addWorker,
    onSuccess: () => {
      queryClient.invalidateQueries(['workers']);
      toast({
        variant: 'success',
        title: 'Radnik dodat',
        description: 'Novi radnik je uspešno dodat',
      });
      setShowAddDialog(false);
      setFormData({ first_name: '', last_name: '', department_id: '' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno dodavanje radnika',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workers']);
      toast({
        variant: 'warning',
        title: 'Radnik izmenjen',
        description: 'Podaci radnika su uspešno ažurirani',
      });
      setEditingWorker(null);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešna izmena radnika',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleWorkerActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['workers']);
      toast({
        variant: 'success',
        title: 'Status promenjen',
        description: 'Status radnika je uspešno izmenjen',
      });
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      first_name: worker.first_name,
      last_name: worker.last_name,
      department_id: worker.department_id.toString(),
      is_active: worker.is_active,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: editingWorker.id,
      data: {
        ...formData,
        department_id: parseInt(formData.department_id),
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Radnici</CardTitle>
              <CardDescription>Upravljanje radnicima i njihovim odeljenjima</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj radnika
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Učitavanje...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Prezime</TableHead>
                  <TableHead>Odeljenje</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>{worker.first_name}</TableCell>
                    <TableCell>{worker.last_name}</TableCell>
                    <TableCell>{worker.department_name}</TableCell>
                    <TableCell>
                      {worker.is_active ? (
                        <Badge variant="success">Aktivan</Badge>
                      ) : (
                        <Badge variant="secondary">Neaktivan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(worker)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate(worker.id)}
                      >
                        <Power className={worker.is_active ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-green-500'} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj novog radnika</DialogTitle>
            <DialogDescription>Unesite podatke za novog radnika</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ime</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Prezime</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Odeljenje</Label>
                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite odeljenje" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Dodavanje...' : 'Dodaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Izmeni radnika</DialogTitle>
            <DialogDescription>Ažurirajte podatke za radnika</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">Ime</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Prezime</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_department">Odeljenje</Label>
                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingWorker(null)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

