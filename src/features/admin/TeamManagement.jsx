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
import { Switch } from '@/components/ui/switch';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/state/authStore';
import { formatDate } from '@/lib/utils';
import {
  getAllWorkers,
  addWorker,
  updateWorker,
  toggleWorkerActive,
  getAllDepartments,
  addDepartment,
  updateDepartment,
  toggleDepartmentActive,
} from '@/lib/services/workerService';
import { UserPlus, Building2, Plus, Edit2, User, Calendar } from 'lucide-react';

export function TeamManagement() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <WorkersTab />
      <DepartmentsTab />
    </div>
  );
}

function WorkersTab() {
  const user = useAuthStore((state) => state.user);
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
    mutationFn: (data) => addWorker(data, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workers']);
      toast({
        variant: 'success',
        title: 'Radnik dodat',
        description: 'Novi radnik je uspesno dodat',
      });
      setShowAddDialog(false);
      setFormData({ first_name: '', last_name: '', department_id: '' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greska',
        description: error.message || 'Neuspesno dodavanje radnika',
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
        description: 'Podaci radnika su uspesno azurirani',
      });
      setEditingWorker(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleWorkerActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['workers']);
      toast({
        variant: 'success',
        title: 'Status promenjen',
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
    <>
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
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ucitavanje...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Ime i prezime</TableHead>
                    <TableHead className="font-semibold">Odeljenje</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger asChild>
                            <button className="font-medium hover:text-brand-red transition-colors cursor-help text-left">
                              {worker.first_name} {worker.last_name}
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72" side="right">
                            <div className="flex space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-brand-red text-white text-lg">
                                  {worker.first_name[0]}{worker.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2 flex-1">
                                <h4 className="text-sm font-semibold">{worker.first_name} {worker.last_name}</h4>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {worker.department_name}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {worker.created_at ? formatDate(worker.created_at) : 'N/A'}
                                </div>
                                <div className="pt-1">
                                  {worker.is_active ? (
                                    <Badge variant="success" className="text-xs">Aktivan</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Neaktivan</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>{worker.department_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={worker.is_active === 1}
                            onCheckedChange={() => toggleMutation.mutate(worker.id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {worker.is_active ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(worker)} className="h-8 w-8 p-0">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Worker Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
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
                Otkazi
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Dodavanje...' : 'Dodaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Izmeni radnika</DialogTitle>
            <DialogDescription>Azurirajte podatke za radnika</DialogDescription>
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
                Otkazi
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Cuvanje...' : 'Sacuvaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DepartmentsTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', true],
    queryFn: () => getAllDepartments(true),
  });

  const addMutation = useMutation({
    mutationFn: (name) => addDepartment(name, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'success',
        title: 'Odeljenje dodato',
        description: 'Novo odeljenje je uspesno dodato',
      });
      setShowAddDialog(false);
      setName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => updateDepartment(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'warning',
        title: 'Odeljenje izmenjeno',
      });
      setEditingDept(null);
      setName('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDepartmentActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast({
        variant: 'success',
        title: 'Status promenjen',
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
    <>
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
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ucitavanje...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Naziv odeljenja</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={dept.is_active === 1}
                            onCheckedChange={() => toggleMutation.mutate(dept.id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {dept.is_active ? 'Aktivno' : 'Neaktivno'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)} className="h-8 w-8 p-0">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dodaj novo odeljenje</DialogTitle>
            <DialogDescription>Unesite naziv novog odeljenja</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv odeljenja</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Otkazi
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Izmeni odeljenje</DialogTitle>
            <DialogDescription>Azurirajte naziv odeljenja</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Naziv odeljenja</Label>
                <Input id="edit_name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingDept(null)}>
                Otkazi
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Cuvanje...' : 'Sacuvaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

