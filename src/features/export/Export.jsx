import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/state/authStore';
import { importItemsFromExcel, previewExcelFile } from '@/lib/services/importService';
import { Download, Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Export() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Izvoz i uvoz</h1>
        <p className="text-muted-foreground">Izvoz izveštaja i uvoz podataka iz Excel fajlova</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Izvoz podataka
            </CardTitle>
            <CardDescription>Izvezite podatke u različitim formatima</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Izveštaji su dostupni direktno iz modula:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Dashboard - Izvoz zaduženja</li>
                <li>Magacin - Izvoz stanja magacina</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Uvoz podataka
            </CardTitle>
            <CardDescription>Uvezite artikle iz Excel fajla (.xls ili .xlsx)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImportSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ImportSection() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Molimo izaberite Excel fajl (.xls ili .xlsx)',
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);

    // Preview file
    try {
      const previewResult = await previewExcelFile(file);
      if (previewResult.success) {
        setPreview(previewResult);
        setShowPreviewDialog(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: previewResult.error || 'Greška pri čitanju fajla',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Greška pri čitanju fajla',
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user) return;

    setImporting(true);
    setShowPreviewDialog(false);

    try {
      const result = await importItemsFromExcel(selectedFile, user.id);

      if (result.success) {
        setImportResult(result);
        setShowResultDialog(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries(['items']);

        toast({
          variant: 'default',
          title: 'Uvoz završen',
          description: `Uspešno uvezeno: ${result.imported}, Ažurirano: ${result.updated}`,
        });

        // Reset file selection
        setSelectedFile(null);
        setPreview(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: result.error || 'Neuspešan uvoz',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Greška pri uvozu podataka',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Izaberite Excel fajl</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelect}
          disabled={importing}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Podržani formati: .xls, .xlsx. Mapiranje kolona: katbr → Kat. broj, naziv → Naziv, stanje → Stanje,
          altjm → M.j., prodajnacena → Prodajna cena, nabavnacena → Nabavna cena, proizvodjac → Proizvođač
        </p>
      </div>

      {importing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uvoz u toku...</span>
            <span>Molimo sačekajte</span>
          </div>
          <Progress className="w-full" />
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pregled podataka za uvoz</DialogTitle>
            <DialogDescription>
              Proverite podatke pre uvoz. Ukupno redova: {preview?.totalRows || 0}
            </DialogDescription>
          </DialogHeader>

          {preview && preview.headers && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Kolone u fajlu:</p>
                <div className="flex flex-wrap gap-2">
                  {preview.headers.map((header, index) => (
                    <Badge key={index} variant="outline">
                      {header.header}
                    </Badge>
                  ))}
                </div>
              </div>

              {preview.preview && preview.preview.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {preview.headers.map((header, index) => (
                          <TableHead key={index}>{header.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.preview.slice(0, 10).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {preview.headers.map((header, colIndex) => (
                            <TableCell key={colIndex}>{row[header.header] || '-'}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Napomena</AlertTitle>
                <AlertDescription>
                  Ako artikal sa istim kataloškim brojem već postoji, biće ažuriran. Novi artikli će biti kreirani.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} disabled={importing}>
              Otkaži
            </Button>
            <Button onClick={handleImport} disabled={importing || !preview}>
              {importing ? 'Uvoz u toku...' : 'Potvrdi uvoz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Rezultat uvoza</DialogTitle>
            <DialogDescription>Detalji uvoza podataka</DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{importResult.imported || 0}</div>
                  <div className="text-sm text-muted-foreground">Uvezeno</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated || 0}</div>
                  <div className="text-sm text-muted-foreground">Ažurirano</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{importResult.failed || 0}</div>
                  <div className="text-sm text-muted-foreground">Neuspešno</div>
                </div>
              </div>

              {importResult.errors > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Greške pri uvozu</AlertTitle>
                  <AlertDescription>
                    {importResult.errors} redova nije moglo biti uvezeno zbog validacionih grešaka.
                  </AlertDescription>
                </Alert>
              )}

              {importResult.details?.errors && importResult.details.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detalji grešaka:</p>
                  <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
                    {importResult.details.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
