import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { searchItems } from '@/lib/utils/searchUtils';
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
import {
  getAllItems,
  addItem,
  addStockToExistingItem,
  getLowStockItems,
  deleteItem,
} from '@/lib/services/inventoryService';
import { createIssue, returnIssue } from '@/lib/services/issueService';
import { getAllWorkers } from '@/lib/services/workerService';
import { Package, Plus, Send, Undo2, AlertTriangle, Trash2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportInventoryPDF, exportInventoryWord, exportInventoryExcel } from '@/lib/services/exportService';

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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="stock">Stanje</TabsTrigger>
          <TabsTrigger value="add">Dodaj robu</TabsTrigger>
          <TabsTrigger value="remove">Obriši artikal</TabsTrigger>
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

        <TabsContent value="remove" className="space-y-4">
          <RemoveStockTab />
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
  const user = useAuthStore((state) => state.user);
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 sekundi
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filteredItems = searchItems(items, searchTerm);

  const lowStockCount = items.filter((item) => item.qty_on_hand <= item.min_qty).length;

  const handleExport = async (format) => {
    setExporting(true);
    try {
      let result;
      if (format === 'pdf') {
        result = await exportInventoryPDF(items, {}, user);
      } else if (format === 'word') {
        result = await exportInventoryWord(items, {}, user);
      } else if (format === 'excel') {
        result = await exportInventoryExcel(items, {}, user);
      }

      if (result?.success) {
        toast({
          variant: 'default',
          title: 'Stanje magacina izvezeno',
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stanje magacina</CardTitle>
              <CardDescription>Pregled svih artikala i njihovih trenutnih količina</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {lowStockCount} ispod minimuma
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <Download className="mr-2 h-4 w-4" />
                Izvezi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="🔍 Pretraži po nazivu, kataloskom broju, proizvođaču..."
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
                    <TableHead className="font-semibold">Proizvođač</TableHead>
                    <TableHead className="font-semibold">Stanje</TableHead>
                    <TableHead className="font-semibold">M.j.</TableHead>
                    <TableHead className="font-semibold">Min. količina</TableHead>
                    <TableHead className="font-semibold">Nabavna cena</TableHead>
                    <TableHead className="font-semibold">Prodajna cena</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.manufacturer_sku || '-'}</TableCell>
                      <TableCell>{item.proizvodjac || '-'}</TableCell>
                      <TableCell className="font-semibold">{item.qty_on_hand}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>{item.min_qty}</TableCell>
                      <TableCell>{item.nabavna_cena ? `${item.nabavna_cena.toFixed(2)} RSD` : '-'}</TableCell>
                      <TableCell>{item.prodajna_cena ? `${item.prodajna_cena.toFixed(2)} RSD` : '-'}</TableCell>
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
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Izvezi stanje magacina</DialogTitle>
            <DialogDescription>Izvezite trenutno stanje magacina u željenom formatu</DialogDescription>
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
                <div className="text-sm text-muted-foreground">.xlsx sa kriticnim stanjem</div>
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
    </>
  );
}

function AddStockTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isNewItem, setIsNewItem] = useState(true);
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // New item form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer_sku: '',
    uom: 'kom',
    min_qty: '',
    initial_qty: '',
    prodajna_cena: '',
    nabavna_cena: '',
    proizvodjac: '',
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
        prodajna_cena: '',
        nabavna_cena: '',
        proizvodjac: '',
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
      prodajna_cena: formData.prodajna_cena ? parseFloat(formData.prodajna_cena) : 0,
      nabavna_cena: formData.nabavna_cena ? parseFloat(formData.nabavna_cena) : 0,
      proizvodjac: formData.proizvodjac || null,
    };

    if (isNaN(data.min_qty) || data.min_qty < 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Unesite validnu minimalnu količinu',
      });
      return;
    }

    if (data.prodajna_cena < 0 || data.nabavna_cena < 0) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Cene moraju biti veće ili jednake 0',
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
                    <Field>
                      <FieldLabel htmlFor="proizvodjac">Proizvođač</FieldLabel>
                      <Input
                        id="proizvodjac"
                        value={formData.proizvodjac}
                        onChange={(e) => setFormData({ ...formData, proizvodjac: e.target.value })}
                        placeholder="Opciono"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="nabavna_cena">Nabavna cena (RSD)</FieldLabel>
                      <Input
                        id="nabavna_cena"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.nabavna_cena}
                        onChange={(e) => setFormData({ ...formData, nabavna_cena: e.target.value })}
                        placeholder="0.00"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="prodajna_cena">Prodajna cena (RSD)</FieldLabel>
                      <Input
                        id="prodajna_cena"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prodajna_cena}
                        onChange={(e) => setFormData({ ...formData, prodajna_cena: e.target.value })}
                        placeholder="0.00"
                      />
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

function RemoveStockTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => deleteItem(itemId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      toast({
        variant: 'success',
        title: 'Artikal obrisan',
        description: 'Artikal je trajno uklonjen iz magacina',
      });
      setSelectedItemId('');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Neuspešno brisanje artikla',
      });
      setIsDialogOpen(false);
    },
  });

  const handleDelete = () => {
    if (!selectedItemId) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Izaberite artikal koji želite da obrišete',
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItemMutation.mutate(parseInt(selectedItemId));
  };

  const selectedItem = items.find((i) => i.id.toString() === selectedItemId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obriši artikal iz magacina</CardTitle>
        <CardDescription>Trajno uklanjanje artikla iz sistema (brisanje, otpis, prestanak korišćenja)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-item">Izaberite artikal *</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger id="delete-item">
                  <SelectValue placeholder="Izaberite artikal za brisanje" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku}) - Stanje: {item.qty_on_hand} {item.uom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-semibold">Detalji artikla:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Naziv:</span>
                    <p className="font-medium">{selectedItem.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kataloški broj:</span>
                    <p className="font-medium">{selectedItem.sku}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trenutno stanje:</span>
                    <p className="font-medium">
                      {selectedItem.qty_on_hand} {selectedItem.uom}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Minimum:</span>
                    <p className="font-medium">
                      {selectedItem.min_qty} {selectedItem.uom}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>UPOZORENJE:</strong> Ova akcija će trajno obrisati artikal iz magacina. Sve povezane informacije
              (istorija stanja, logovi) će biti uklonjene. Ova akcija se NE MOŽE poništiti!
            </AlertDescription>
          </Alert>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={!selectedItemId} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Obriši artikal iz magacina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Potvrdite brisanje
                </DialogTitle>
                <DialogDescription>Da li ste apsolutno sigurni da želite da obrišete ovaj artikal?</DialogDescription>
              </DialogHeader>
              {selectedItem && (
                <div className="p-4 bg-muted rounded-lg my-4">
                  <p className="font-semibold mb-2">Brisanje artikla:</p>
                  <p className="text-sm">
                    <strong>{selectedItem.name}</strong> ({selectedItem.sku})
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stanje: {selectedItem.qty_on_hand} {selectedItem.uom}
                  </p>
                </div>
              )}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ovo je trajno brisanje!</strong>
                  <br />
                  Artikal će biti potpuno uklonjen iz sistema i ova akcija se ne može poništiti.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Otkaži
                </Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleteItemMutation.isPending}>
                  {deleteItemMutation.isPending ? 'Brisanje...' : 'Da, obriši trajno'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueTab() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => getAllWorkers(),
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [qty, setQty] = useState('');

  const issueMutation = useMutation({
    mutationFn: ({ itemId, workerId, qty }) => createIssue(itemId, workerId, qty, user.id),
    onSuccess: () => {
      // Immediately invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });

      // Force refetch to show immediately
      queryClient.refetchQueries({ queryKey: ['items'], exact: false });
      queryClient.refetchQueries({ queryKey: ['issues'], exact: false });

      toast({
        variant: 'success',
        title: '✅ Roba zadužena',
        description: 'Artikal je uspešno zadužen radniku i prikazan na Dashboard-u',
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
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => getAllWorkers(),
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [qty, setQty] = useState('');

  const returnMutation = useMutation({
    mutationFn: ({ itemId, workerId, qty }) => returnIssue(itemId, workerId, qty, user.id),
    onSuccess: () => {
      // Immediately invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });

      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['items'], exact: false });
      queryClient.refetchQueries({ queryKey: ['issues'], exact: false });

      toast({
        variant: 'success',
        title: '✅ Roba vraćena',
        description: 'Artikal je uspešno vraćen u magacin i stanje je ažurirano',
      });
      setSelectedItemId('');
      setSelectedWorkerId('');
      setQty('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '❌ Greška pri vraćanju',
        description: error.message || 'Neuspešno vraćanje robe u magacin',
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
    refetchOnWindowFocus: true,
    staleTime: 60000, // 1 minut
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
