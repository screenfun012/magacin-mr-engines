import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export function Export() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Izvoz</h1>
        <p className="text-muted-foreground">Izvoz izveštaja i podataka</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              CSV Izvoz
            </CardTitle>
            <CardDescription>Izvezite podatke u CSV format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Uskoro dostupno
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Excel Izvoz
            </CardTitle>
            <CardDescription>Izvezite podatke u Excel format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Uskoro dostupno
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              PDF Izveštaj
            </CardTitle>
            <CardDescription>Kreirajte PDF izveštaj</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Uskoro dostupno
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mogućnosti izvoza (planirana funkcionalnost)</CardTitle>
          <CardDescription>
            Modularni sistem za izvoz podataka je pripremljen arhitekturalno i biće implementiran u budućim verzijama.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Izvoz stanja magacina u različitim formatima</li>
            <li>Izvoz zaduženja po radnicima</li>
            <li>Izvoz istorije transakcija</li>
            <li>Izvoz logova sistema</li>
            <li>Prilagodljivi izveštaji sa filterima</li>
            <li>Automatski periodični izveštaji</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

