import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/state/authStore';
import { loginUser } from '@/lib/services/authService';
import { toast } from '@/components/ui/use-toast';
import mrEnginesLogo from '@/assets/logos/mr-engines-light.png';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser(username, password);

      if (result.success) {
        login(result.user);
        toast({
          variant: 'success',
          title: 'Uspešna prijava',
          description: `Dobrodošli, ${result.user.username}!`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Greška pri prijavljivanju',
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Greška',
        description: 'Neuspešna prijava. Pokušajte ponovo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-black via-brand-gray to-brand-red/20 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8">
          <div className="mb-6 px-8">
            <img src={mrEnginesLogo} alt="MR Engines" className="w-full h-auto max-w-[280px] mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Sistem za upravljanje magacinom</CardTitle>
          <CardDescription className="text-center">Prijavite se da biste pristupili aplikaciji</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Korisničko ime
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Unesite korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Lozinka
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Unesite lozinku"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Prijavljivanje...
                </>
              ) : (
                'Prijavi se'
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm font-semibold mb-2 text-center">Default administratorski pristup</p>
            <div className="space-y-1 text-sm text-muted-foreground text-center">
              <p>
                <code className="px-3 py-1.5 bg-background rounded font-mono">admin / admin123</code>
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">Promenite lozinku nakon prvog prijavljivanja</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
