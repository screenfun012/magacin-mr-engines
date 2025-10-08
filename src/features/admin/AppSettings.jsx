import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { checkForUpdates, downloadAndInstallUpdate, restartApp } from '@/lib/services/updateService';
import { Download, RefreshCw, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';
import { useEffect } from 'react';

export function AppSettings() {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  useEffect(() => {
    async function loadVersion() {
      try {
        const version = await getVersion();
        setCurrentVersion(version);
      } catch (error) {
        console.error('Failed to get app version:', error);
      }
    }
    loadVersion();
  }, []);

  const handleCheckUpdates = async () => {
    setChecking(true);
    try {
      const update = await checkForUpdates();

      if (update.available) {
        setUpdateAvailable(update);
        toast({
          variant: 'success',
          title: 'Ažuriranje dostupno',
          description: `Nova verzija ${update.version} je dostupna`,
        });
      } else if (update.error) {
        toast({
          variant: 'destructive',
          title: 'Greška pri proveri',
          description: update.error,
        });
      } else {
        toast({
          title: 'Nema ažuriranja',
          description: 'Koristite najnoviju verziju aplikacije',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Neuspešna provera ažuriranja',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleDownload = async () => {
    if (!updateAvailable) return;

    setDownloading(true);
    try {
      const result = await downloadAndInstallUpdate(updateAvailable, (progress) => {
        setDownloadProgress(Math.round((progress.downloaded / progress.total) * 100));
      });

      if (result.success) {
        toast({
          variant: 'success',
          title: 'Ažuriranje instalirano',
          description: 'Restartujte aplikaciju da primenite izmene',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: result.error || 'Neuspešno instaliranje ažuriranja',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Neuspešno preuzimanje ažuriranja',
      });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleRestart = async () => {
    await restartApp();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacije o aplikaciji</CardTitle>
          <CardDescription>Verzija i podaci o sistemu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Trenutna verzija</p>
              <p className="text-2xl font-bold">{currentVersion}</p>
            </div>
            <Package className="w-12 h-12 text-brand-red" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Naziv:</strong> Magacin App
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Platforma:</strong> Tauri Desktop Application
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Tehnologije:</strong> React, SQLite, shadcn/ui
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ažuriranja aplikacije</CardTitle>
          <CardDescription>Proverite i instalirajte najnoviju verziju</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!updateAvailable ? (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Status ažuriranja</AlertTitle>
                <AlertDescription>
                  Koristite trenutnu verziju aplikacije. Kliknite na dugme ispod da proverite da li postoje nova ažuriranja.
                </AlertDescription>
              </Alert>

              <Button onClick={handleCheckUpdates} disabled={checking}>
                <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Provera...' : 'Proveri ažuriranja'}
              </Button>
            </>
          ) : (
            <>
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nova verzija dostupna</AlertTitle>
                <AlertDescription>
                  Verzija {updateAvailable.version} je dostupna za preuzimanje
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button onClick={() => setShowReleaseNotes(true)} variant="outline" className="w-full">
                  Prikaži Release Notes
                </Button>

                {downloading ? (
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-brand-red h-2 rounded-full transition-all"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Preuzimanje: {downloadProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Preuzmi i instaliraj
                    </Button>
                    <Button onClick={handleRestart} variant="outline">
                      Restartuj
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Podešavanja kanala</CardTitle>
          <CardDescription>Izaberite kanal za prijem ažuriranja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Stable</p>
              <p className="text-sm text-muted-foreground">Stabilna, testirana izdanja</p>
            </div>
            <Badge>Aktivan</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Beta</p>
              <p className="text-sm text-muted-foreground">Rana izdanja sa novim funkcijama</p>
            </div>
            <Badge variant="secondary">Placeholder</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Release Notes Dialog */}
      <Dialog open={showReleaseNotes} onOpenChange={setShowReleaseNotes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Notes - Verzija {updateAvailable?.version}</DialogTitle>
            <DialogDescription>
              Datum: {updateAvailable?.date || 'N/A'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-sm whitespace-pre-wrap">
              {updateAvailable?.body || 'Nema dostupnih informacija o izdanju.'}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowReleaseNotes(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

