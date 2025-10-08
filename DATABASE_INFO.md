# Informacije o bazi podataka

## Lokacija baze podataka

Aplikacija koristi SQLite bazu koja se čuva u app data folderu operativnog sistema:

### macOS

```
~/Library/Application Support/com.mrengines.magacin/app.db
```

### Windows

```
%APPDATA%\com.mrengines.magacin\app.db
```

### Linux

```
~/.local/share/com.mrengines.magacin/app.db
```

## Perzistencija podataka

**✅ Podaci se trajno čuvaju između sesija!**

Svi podaci koje unesete (radnici, materijali, zaduženja) ostaju sačuvani nakon zatvaranja aplikacije.

## Verzioniranje baze

Aplikacija koristi verzioniranje za seed podatke:

- **Version 1**: Inicijalni seed podaci (admin korisnik, demo radnici, artikli)
- Seed se izvršava **samo jednom** - prvo pokretanje
- Kasnije promene se čuvaju trajno

## Provera podataka

Ako želite da proverite da li se podaci čuvaju:

1. Dodajte radnika ili artikal
2. Zatvorite aplikaciju potpuno
3. Ponovo pokrenite aplikaciju
4. Proverite da li je podatak još uvek tu

## Reset baze podataka

Ako želite da resetujete bazu na početno stanje:

### macOS

```bash
rm ~/Library/Application\ Support/com.mrengines.magacin/app.db
```

### Windows (PowerShell)

```powershell
Remove-Item "$env:APPDATA\com.mrengines.magacin\app.db"
```

### Linux

```bash
rm ~/.local/share/com.mrengines.magacin/app.db
```

Nakon brisanja baze, ponovo pokrenite aplikaciju i biće kreirana nova baza sa inicijalnim podacima.

## Backup baze

Da napravite backup:

### macOS

```bash
cp ~/Library/Application\ Support/com.mrengines.magacin/app.db ~/Desktop/magacin-backup.db
```

Da vratite backup:

```bash
cp ~/Desktop/magacin-backup.db ~/Library/Application\ Support/com.mrengines.magacin/app.db
```

## Migracije

Šema baze koristi `CREATE TABLE IF NOT EXISTS` što omogućava bezbedan upgrade aplikacije.

Nove verzije aplikacije mogu dodati:

- Nove tabele
- Nove kolone
- Nove indekse

Bez brisanja postojećih podataka.

## Debugging

Ako imate problem sa perzistencijom:

1. Proverite da li baza postoji na navedenim lokacijama
2. Proverite permissions na folderu
3. Pogledajte Console log u aplikaciji za SQL greške
4. Proverite da li postoji `db_version` tabela sa verzijom 1

## Seed podaci

Inicijalni seed uključuje:

- **2 korisnika**: admin (admin/admin123), radnik1 (radnik1/user123)
- **3 odeljenja**: Proizvodnja, Održavanje, Administracija
- **6 radnika**: Petar, Marko, Jovan, Ana, Milan, Jovana
- **8 artikala**: Zaštitne rukavice, naočare, ulje, šlemovi, papir, žice, kaiševi, cipele
- **6 primera zaduženja**

Svi novi podaci koje dodate nakon toga se čuvaju trajno.
