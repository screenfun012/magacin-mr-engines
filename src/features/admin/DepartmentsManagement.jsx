import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  getAllDepartments,
  addDepartment,
  updateDepartment,
  toggleDepartmentActive,
} from '@/lib/services/workerService';
import { Building2, Plus, Edit2, Power } from 'lucide-react';

export function DepartmentsManagement() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', true],
    queryFn: () => getAllDepartments(true),
  });

  const addMutation = useMutation({
    mutationFn: addDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'success',
        title: 'Odeljenje dodato',
        description: 'Novo odeljenje je uspešno dodato',
      });
      setShowAddDialog(false);
      setName('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno dodavanje odeljenja',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => updateDepartment(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'warning',
        title: 'Odeljenje izmenjeno',
        description: 'Odeljenje je uspešno ažurirano',
      });
      setEditingDept(null);
      setName('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešna izmena odeljenja',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDepartmentActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'success',
        title: 'Status promenjen',
        description: 'Status odeljenja je uspešno izmenjen',
      });
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate(name);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editingDept.id, name });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Odeljenja</CardTitle>
            <CardDescription>Upravljanje odeljenjima u kompaniji</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj odeljenje
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
                <TableHead>Naziv odeljenja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    {dept.is_active ? (
                      <Badge variant="success">Aktivno</Badge>
                    ) : (
                      <Badge variant="secondary">Neaktivno</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate(dept.id)}
                    >
                      <Power className={dept.is_active ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-green-500'} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj novo odeljenje</DialogTitle>
            <DialogDescription>Unesite naziv novog odeljenja</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv odeljenja</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
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
      <Dialog open={!!editingDept} onOpenChange={() => setEditingDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Izmeni odeljenje</DialogTitle>
            <DialogDescription>Ažurirajte naziv odeljenja</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Naziv odeljenja</Label>
                <Input
                  id="edit_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingDept(null)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

