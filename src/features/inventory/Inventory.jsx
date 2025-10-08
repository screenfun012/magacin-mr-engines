import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/state/authStore';
import { getAllItems, addItem, addStockToExistingItem, getLowStockItems } from '@/lib/services/inventoryService';
import { createIssue, returnIssue } from '@/lib/services/issueService';
import { getAllWorkers } from '@/lib/services/workerService';
import { Package, Plus, Send, Undo2, AlertTriangle } from 'lucide-react';

const UNIT_OPTIONS = ['kom', 'l', 'g', 'kg', 'm', 'par', 'pak'];

export function Inventory() {
  const isFetching = useIsFetching({ queryKey: ['items'] });

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Magacin</h1>
          {isFetching > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-red/10 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-brand-red rounded-full animate-ping"></div>
              <span className="text-xs font-medium text-brand-red">Ažuriranje...</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">Upravljanje artiklima i stanjima • Automatsko osvežavanje</p>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stock">Stanje</TabsTrigger>
          <TabsTrigger value="add">Dodaj robu</TabsTrigger>
          <TabsTrigger value="issue">Izdaj robu</TabsTrigger>
          <TabsTrigger value="return">Vrati robu</TabsTrigger>
          <TabsTrigger value="low-stock">Za poručivanje</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <StockTab />
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <AddStockTab />
        </TabsContent>

        <TabsContent value="issue" className="space-y-4">
          <IssueTab />
        </TabsContent>

        <TabsContent value="return" className="space-y-4">
          <ReturnTab />
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <LowStockTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockTab() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchInterval: 2000, // Automatski refresh svakih 2 sekunde
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.name?.toLowerCase().includes(search) || item.sku?.toLowerCase().includes(search);
  });

  const lowStockCount = items.filter((item) => item.qty_on_hand <= item.min_qty).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stanje magacina</CardTitle>
            <CardDescription>Pregled svih artikala i njihovih trenutnih količina</CardDescription>
          </div>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {lowStockCount} ispod minimuma
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="🔍 Pretraži po nazivu ili kataloskom broju..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Učitavanje artikala...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Naziv</TableHead>
                  <TableHead className="font-semibold">Kat. broj</TableHead>
                  <TableHead className="font-semibold">Kat. broj proizvođača</TableHead>
                  <TableHead className="font-semibold">Stanje</TableHead>
                  <TableHead className="font-semibold">M.j.</TableHead>
                  <TableHead className="font-semibold">Min. količina</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.manufacturer_sku || '-'}</TableCell>
                    <TableCell className="font-semibold">{item.qty_on_hand}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>{item.min_qty}</TableCell>
                    <TableCell>
                      {item.qty_on_hand <= item.min_qty ? (
                        <Badge variant="destructive">Nisko stanje</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddStockTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isNewItem, setIsNewItem] = useState(true);
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  // New item form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer_sku: '',
    uom: 'kom',
    min_qty: '',
    initial_qty: '',
  });

  // Add to existing item
  const [selectedItemId, setSelectedItemId] = useState('');
  const [addQty, setAddQty] = useState('');

  const addItemMutation = useMutation({
    mutationFn: (data) => addItem(data, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      toast({
        variant: 'success',
        title: 'Artikal dodat',
        description: 'Novi artikal je uspešno dodat u magacin',
      });
      setFormData({
        name: '',
        sku: '',
        manufacturer_sku: '',
        uom: 'kom',
        min_qty: '',
        initial_qty: '',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno dodavanje artikla',
      });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: ({ itemId, qty }) => addStockToExistingItem(itemId, qty, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      toast({
        variant: 'success',
        title: 'Stanje ažurirano',
        description: 'Količina je uspešno dodata na postojeći artikal',
      });
      setSelectedItemId('');
      setAddQty('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno ažuriranje stanja',
      });
    },
  });

  const handleNewItemSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      min_qty: parseFloat(formData.min_qty),
      initial_qty: parseFloat(formData.initial_qty) || 0,
    };

    if (isNaN(data.min_qty) || data.min_qty < 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Unesite validnu minimalnu količinu',
      });
      return;
    }

    addItemMutation.mutate(data);
  };

  const handleAddStock = (e) => {
    e.preventDefault();

    const qty = parseFloat(addQty);

    if (!selectedItemId || isNaN(qty) || qty <= 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Izaberite artikal i unesite validnu količinu',
      });
      return;
    }

    addStockMutation.mutate({ itemId: parseInt(selectedItemId), qty });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dodaj robu u magacin</CardTitle>
          <CardDescription>Kreirajte novi artikal ili dopunite postojeći</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isNewItem ? 'new' : 'existing'} onValueChange={(v) => setIsNewItem(v === 'new')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Novi artikal</TabsTrigger>
              <TabsTrigger value="existing">Dopuni postojeći</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 mt-4">
              <form onSubmit={handleNewItemSubmit}>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-6">
                    <Field>
                      <FieldLabel htmlFor="name">Naziv artikla</FieldLabel>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Unesite naziv"
                        required
                      />
                      <FieldDescription>Pun naziv artikla</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="sku">Kataloški broj</FieldLabel>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="npr. ZR-001"
                        required
                      />
                      <FieldDescription>Interni kataloški broj</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="manufacturer_sku">Kat. broj proizvođača</FieldLabel>
                      <Input
                        id="manufacturer_sku"
                        value={formData.manufacturer_sku}
                        onChange={(e) => setFormData({ ...formData, manufacturer_sku: e.target.value })}
                        placeholder="Opciono"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="uom">Merna jedinica</FieldLabel>
                      <Select value={formData.uom} onValueChange={(v) => setFormData({ ...formData, uom: v })}>
                        <SelectTrigger id="uom">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="min_qty">Minimalna količina</FieldLabel>
                      <Input
                        id="min_qty"
                        type="number"
                        step="0.01"
                        value={formData.min_qty}
                        onChange={(e) => setFormData({ ...formData, min_qty: e.target.value })}
                        placeholder="0"
                        required
                      />
                      <FieldDescription>Alert kada stanje padne ispod</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="initial_qty">Početno stanje</FieldLabel>
                      <Input
                        id="initial_qty"
                        type="number"
                        step="0.01"
                        value={formData.initial_qty}
                        onChange={(e) => setFormData({ ...formData, initial_qty: e.target.value })}
                        placeholder="0"
                      />
                      <FieldDescription>Početna količina u magacinu</FieldDescription>
                    </Field>
                  </div>
                  <Field orientation="horizontal" className="pt-2">
                    <Button type="submit" disabled={addItemMutation.isPending}>
                      <Plus className="w-4 h-4 mr-2" />
                      {addItemMutation.isPending ? 'Dodavanje...' : 'Dodaj artikal'}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4 mt-4">
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item">Artikal *</Label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite artikal" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} ({item.sku}) - Trenutno: {item.qty_on_hand} {item.uom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty">Količina za dodavanje *</Label>
                    <Input
                      id="qty"
                      type="number"
                      step="0.01"
                      value={addQty}
                      onChange={(e) => setAddQty(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={addStockMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {addStockMutation.isPending ? 'Dodavanje...' : 'Dopuni stanje'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function IssueTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });
  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => getAllWorkers(),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [qty, setQty] = useState('');

  const issueMutation = useMutation({
    mutationFn: ({ itemId, workerId, qty }) => createIssue(itemId, workerId, qty, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['issues']);
      toast({
        variant: 'success',
        title: 'Roba zad užena',
        description: 'Artikal je uspešno zadužen radniku',
      });
      setSelectedItemId('');
      setSelectedWorkerId('');
      setQty('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno zaduženje',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const qtyNum = parseFloat(qty);

    if (!selectedItemId || !selectedWorkerId || isNaN(qtyNum) || qtyNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Popunite sva polja sa validnim vrednostima',
      });
      return;
    }

    issueMutation.mutate({
      itemId: parseInt(selectedItemId),
      workerId: parseInt(selectedWorkerId),
      qty: qtyNum,
    });
  };

  const selectedItem = items.find((i) => i.id.toString() === selectedItemId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izdaj robu radniku</CardTitle>
        <CardDescription>Zaduži artikal određenom radniku</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="worker">Radnik *</Label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite radnika" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id.toString()}>
                      {worker.first_name} {worker.last_name} ({worker.department_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-item">Artikal *</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite artikal" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} - Na stanju: {item.qty_on_hand} {item.uom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-qty">Količina *</Label>
              <Input
                id="issue-qty"
                type="number"
                step="0.01"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedItem && (
            <Alert variant={selectedItem.qty_on_hand <= selectedItem.min_qty ? 'warning' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Trenutno stanje</AlertTitle>
              <AlertDescription>
                Na magacinu: {selectedItem.qty_on_hand} {selectedItem.uom}
                {selectedItem.qty_on_hand <= selectedItem.min_qty && ' (Nisko stanje!)'}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={issueMutation.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {issueMutation.isPending ? 'Izdavanje...' : 'Izdaj robu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReturnTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });
  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => getAllWorkers(),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [qty, setQty] = useState('');

  const returnMutation = useMutation({
    mutationFn: ({ itemId, workerId, qty }) => returnIssue(itemId, workerId, qty, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['issues']);
      toast({
        variant: 'success',
        title: 'Roba vraćena',
        description: 'Artikal je uspešno vraćen u magacin',
      });
      setSelectedItemId('');
      setSelectedWorkerId('');
      setQty('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno vraćanje',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const qtyNum = parseFloat(qty);

    if (!selectedItemId || !selectedWorkerId || isNaN(qtyNum) || qtyNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Popunite sva polja sa validnim vrednostima',
      });
      return;
    }

    returnMutation.mutate({
      itemId: parseInt(selectedItemId),
      workerId: parseInt(selectedWorkerId),
      qty: qtyNum,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vrati robu u magacin</CardTitle>
        <CardDescription>Vratite zaduženi artikal nazad u magacin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return-worker">Radnik *</Label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite radnika" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id.toString()}>
                      {worker.first_name} {worker.last_name} ({worker.department_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-item">Artikal *</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite artikal" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-qty">Količina *</Label>
              <Input
                id="return-qty"
                type="number"
                step="0.01"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={returnMutation.isPending}>
            <Undo2 className="w-4 h-4 mr-2" />
            {returnMutation.isPending ? 'Vraćanje...' : 'Vrati robu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LowStockTab() {
  const { data: lowStockItems = [], isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: getLowStockItems,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artikli za poručivanje</CardTitle>
        <CardDescription>Pregled artikala sa niskim stanjem (ispod ili na minimalnoj količini)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Učitavanje...</div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Svi artikli imaju dovoljno stanje</p>
            <p className="text-sm text-muted-foreground">Nema artikala koji zahtevaju poručivanje</p>
          </div>
        ) : (
          <>
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Upozorenje</AlertTitle>
              <AlertDescription>
                Pronađeno je {lowStockItems.length} artikal(a) sa niskim stanjem. Razmislite o poručivanju.
              </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Kat. broj</TableHead>
                  <TableHead>Trenutno stanje</TableHead>
                  <TableHead>Min. količina</TableHead>
                  <TableHead>M.j.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{item.qty_on_hand}</TableCell>
                    <TableCell>{item.min_qty}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Nisko</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
