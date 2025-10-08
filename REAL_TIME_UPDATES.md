# Real-Time Ažuriranje Podataka

## Implementacija

Sistem je konfigurisan da automatski ažurira podatke u realnom vremenu kako bi korisnici uvek videli najsvežije informacije bez potrebe za ručnim osvežavanjem stranice.

## Konfigurisane komponente

### 1. Dashboard (`/src/features/dashboard/Dashboard.jsx`)

- **Zaduženja po mesecima**: Automatski refetch svakih 5 sekundi
- **Istorija izmena zaduženja**: Real-time ažuriranje
- **Statistike**: Dinamički prikaz broja zaduženja, radnika i artikala

### 2. Magacin (`/src/features/inventory/Inventory.jsx`)

- **Stanje magacina**: Automatsko ažuriranje inventara
- **Lista artikala**: Real-time prikaz količina
- **Artikli za poručivanje**: Ažuriranje liste artikala sa niskim stanjem
- **Liste radnika**: Automatsko osvežavanje

### 3. Statistika (`/src/features/admin/Statistics.jsx`)

- **Ukupni pokazatelji**: Real-time metrike
- **Grafici i dijagrami**: Automatsko ažuriranje vizualizacija
- **Distribucija po odeljenjima**: Dinamički prikaz

## Postavke ažuriranja

### Globalna konfiguracija (App.jsx)

```javascript
refetchOnWindowFocus: true; // Ažuriraj kada korisnik vrati fokus na aplikaciju
refetchOnMount: true; // Ažuriraj pri montiranju komponente
staleTime: 1000; // Podaci zastareli nakon 1 sekunde
cacheTime: 300000; // Keširaj podatke 5 minuta
retry: 1; // Ponovi neuspele zahteve jednom
```

### Komponente sa intervalskim ažuriranjem

```javascript
refetchInterval: 2000; // Automatski refresh svakih 2 sekunde - brzi real-time
```

## Kako radi

1. **Interval refetch**: Podaci se automatski osvežavaju svakih 2 sekunde u pozadini
2. **Window focus refetch**: Kada korisnik vrati fokus na aplikaciju, podaci se odmah ažuriraju
3. **Mount refetch**: Pri otvaranju stranice/komponente, podaci se učitavaju iznova
4. **Optimistic updates**: Pri izmeni podataka, UI se odmah ažurira, a zatim se sinhronizuje sa serverom
5. **Cache invalidation**: Nakon mutacija (dodavanje, izmena, brisanje), svi povezani query-ji se invalidiraju

## Prednosti

- **Uvek svež prikaz**: Korisnici vide najnovije podatke bez potrebe za ručnim osvežavanjem
- **Bolja UX**: Aplikacija deluje brže i responzivnije
- **Multi-korisnik podrška**: Promena jednog korisnika vidljiva je drugima u realnom vremenu
- **Optimizovano**: Inteligentno keširање smanjuje nepotrebne zahteve

## Opcije za fine-tuning

Ako treba podesiti brzinu ažuriranja:

1. **Sporije ažuriranje** (štedi resurse):

   ```javascript
   refetchInterval: 10000; // 10 sekundi
   staleTime: 5000; // 5 sekundi
   ```

2. **Brže ažuriranje** (realniji real-time):

   ```javascript
   refetchInterval: 2000; // 2 sekunde
   staleTime: 1000; // 1 sekunda
   ```

3. **Isključivanje automatskog ažuriranja**:
   ```javascript
   refetchInterval: false;
   refetchOnWindowFocus: false;
   ```

## Toast Notifikacije

Toast notifikacije su ažurirane sa:

- **Solidne pozadine**: Bez transparencije, čitljive i jasne
- **Ikone**: Vizuelni indikatori za svaki tip notifikacije (success, warning, destructive)
- **Bolji kontrast**: Beli tekst na obojenim pozadinama za bolje čitanje
- **Animacije**: Smooth slide-in/out efekti
- **Vidljivo X dugme**: Uvek prisutno za lako zatvaranje

## Performance napomena

Trenutna konfiguracija (2s interval) obezbeđuje brz real-time update. Podaci se osvežavaju svakih 2 sekunde, što je odličan balans između brzine i performansi. Za sporije mašine ili veće baze podataka, može se povećati na 5-10 sekundi.
