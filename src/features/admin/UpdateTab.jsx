import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  checkForUpdates,
  downloadAndInstallUpdate,
  restartApp,
  getCurrentVersion,
} from '@/lib/services/updateService';
import { Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, Rocket } from 'lucide-react';

export function UpdateTab() {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installed, setInstalled] = useState(false);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setUpdateInfo(null);
    setInstalled(false);

    try {
      const result = await checkForUpdates();
      setUpdateInfo(result);

      if (result.available) {
        toast({
          variant: 'default',
          title: 'Nova verzija dostupna!',
          description: `Verzija ${result.version} je spremna za instalaciju`,
        });
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: result.error,
        });
      } else {
        toast({
          variant: 'default',
          title: 'Nema update-a',
          description: 'Aplikacija je već na najnovijoj verziji',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Greška pri proveri update-a',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleInstallUpdate = async () => {
    if (!updateInfo || !updateInfo.available) return;

    setInstalling(true);
    setInstallProgress(0);

    try {
      const result = await downloadAndInstallUpdate(updateInfo, (progress) => {
        setInstallProgress(progress.percentage);
      });

      if (result.success) {
        setInstalled(true);
        toast({
          variant: 'default',
          title: 'Update instaliran!',
          description: 'Kliknite "Restartuj aplikaciju" da primeni izmene',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška',
          description: result.error || 'Greška pri instalaciji update-a',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: error.message || 'Greška pri instalaciji update-a',
      });
    } finally {
      setInstalling(false);
    }
  };

  const handleRestart = async () => {
    const result = await restartApp();
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: result.error || 'Greška pri restartovanju aplikacije',
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ažuriranja</h2>
        <p className="text-muted-foreground">Proverite i instalirajte najnovije verzije aplikacije</p>
      </div>

      {/* Current Version Card */}
      <Card>
        <CardHeader>
          <CardTitle>Trenutna verzija</CardTitle>
          <CardDescription>Informacije o instaliranoj verziji aplikacije</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-brand-red">v{getCurrentVersion()}</div>
              <p className="text-sm text-muted-foreground mt-1">Magacin - MR Engines</p>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Aktivna
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Check for Updates Card */}
      <Card>
        <CardHeader>
          <CardTitle>Provera update-a</CardTitle>
          <CardDescription>Proverite da li je dostupna nova verzija na GitHub-u</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckForUpdates} disabled={checking || installing} className="w-full">
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Proveravam...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Proveri za update
              </>
            )}
          </Button>

          {updateInfo && !updateInfo.available && !updateInfo.error && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Nema dostupnih update-a</AlertTitle>
              <AlertDescription>{updateInfo.message || 'Aplikacija je ažurna!'}</AlertDescription>
            </Alert>
          )}

          {updateInfo && updateInfo.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Greška</AlertTitle>
              <AlertDescription>{updateInfo.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Update Card */}
      {updateInfo && updateInfo.available && (
        <Card className="border-brand-red">
          <CardHeader>
            <CardTitle className="flex items-center text-brand-red">
              <Download className="mr-2 h-5 w-5" />
              Nova verzija dostupna!
            </CardTitle>
            <CardDescription>Preuzmi i instaliraj najnoviju verziju</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-semibold">Verzija {updateInfo.version}</div>
                <div className="text-sm text-muted-foreground">
                  {updateInfo.date ? new Date(updateInfo.date).toLocaleDateString('sr-RS') : 'Nedavno'}
                </div>
              </div>
              <Badge variant="default" className="text-sm px-3 py-1">
                Nova
              </Badge>
            </div>

            {updateInfo.body && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Šta je novo:</p>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{updateInfo.body}</div>
              </div>
            )}

            {installing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Preuzimanje i instalacija...</span>
                  <span className="font-semibold">{installProgress}%</span>
                </div>
                <Progress value={installProgress} className="w-full" />
              </div>
            )}

            {!installed && !installing && (
              <Button onClick={handleInstallUpdate} disabled={installing} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Instaliraj update
              </Button>
            )}

            {installed && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Update instaliran!</AlertTitle>
                  <AlertDescription>
                    Nova verzija je uspešno instalirana. Restartujte aplikaciju da primeni izmene.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleRestart} className="w-full" size="lg" variant="default">
                  <Rocket className="mr-2 h-4 w-4" />
                  Restartuj aplikaciju
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Kako funkcioniše update sistem?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Aplikacija proverava GitHub Releases za nove verzije</li>
            <li>Update-i se preuzimaju automatski kada kliknete "Instaliraj update"</li>
            <li>Nakon instalacije, potreban je restart aplikacije</li>
            <li>Vaši podaci ostaju sačuvani tokom update-a</li>
            <li>Update je potpuno automatski i siguran</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

