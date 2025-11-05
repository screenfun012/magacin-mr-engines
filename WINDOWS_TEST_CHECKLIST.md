# Windows Test Checklist - v1.1.0

## Pre-testiranje
- [ ] Pristup Windows mašini
- [ ] Git instaliran
- [ ] Node.js i npm instalirani
- [ ] Rust i Tauri CLI instalirani

---

## Korak 1: Pull najnovijeg koda

```bash
cd C:\path\to\magacin-app
git pull origin main
```

**Očekivani rezultat:** Uspešan pull bez konflikata

---

## Korak 2: Instalacija dependencies

```bash
npm install
```

**Očekivani rezultat:** 
- Instalacija `xlsx@0.18.5`
- Instalacija `exceljs@4.4.0`
- Instalacija `jspdf@2.5.2`, `jspdf-autotable@3.8.4`
- Instalacija `docx@8.5.0`
- Instalacija `@tauri-apps/plugin-dialog@2.4.0`
- Instalacija `@tauri-apps/plugin-fs@2.4.2`

---

## Korak 3: Dev mode test

```bash
npm run tauri:dev
```

### Test 1: Aplikacija startuje
- [ ] Aplikacija se otvara bez grešaka
- [ ] Nema crash-ova pri startu

### Test 2: Database migration
- [ ] Aplikacija startuje prvi put (migration se izvršava)
- [ ] Proveri konzolu za poruke: `✅ Added prodajna_cena column`, `✅ Added nabavna_cena column`, `✅ Added proizvodjac column`

### Test 3: Nova polja u Magacinu
- [ ] Otvori "Magacin" tab → "Stanje"
- [ ] Proveri da li postoje kolone: **Proizvođač**, **Nabavna cena**, **Prodajna cena**
- [ ] Proveri da li se prikazuju postojeći podaci

### Test 4: Dodavanje novog artikla sa novim poljima
- [ ] Otvori "Magacin" tab → "Dodaj robu" → "Novi artikal"
- [ ] Popuni sva polja UKLJUČUJUĆI: Proizvođač, Nabavna cena, Prodajna cena
- [ ] Klikni "Dodaj artikal"
- [ ] **Očekivano:** Artikal se dodaje bez greške
- [ ] Proveri u tabeli "Stanje" da li se novi artikal prikazuje sa svim podacima

### Test 5: "Izvoz i uvoz" tab
- [ ] Otvori "Izvoz i uvoz" tab
- [ ] Proveri da li se prikazuje:
  - Izvoz podataka card (levo)
  - Uvoz podataka card (desno)

### Test 6: Excel import - File selection
- [ ] Klikni "Choose File" u Uvoz sekciji
- [ ] Izaberi `lager.xls` fajl
- [ ] **Očekivano:** Preview dialog se otvara

### Test 7: Excel import - Preview
- [ ] Proveri da li Preview prikazuje:
  - Kolone iz fajla (katbr, naziv, stanje, altjm, prodajnacena, nabavnacena, proizvodjac)
  - Prvih 10 redova podataka
  - Ukupan broj redova
- [ ] Klikni "Otkaži" za sada (ne importuj još)

### Test 8: Excel import - Full import
- [ ] Ponovo izaberi `lager.xls` fajl
- [ ] U Preview dialog-u klikni "Potvrdi uvoz"
- [ ] **Očekivano:** 
  - Progress bar se prikazuje
  - Result dialog se otvara sa statistikom (Uvezeno, Ažurirano, Neuspešno)
- [ ] Proveri u "Magacin" → "Stanje" da li su artikli uvezeni
- [ ] Proveri da li imaju popunjena nova polja (Proizvođač, cene)

### Test 9: Export iz Dashboard-a
- [ ] Otvori "Dashboard" tab
- [ ] Klikni "Izvezi izveštaj" dugme
- [ ] Izaberi "PDF dokument"
- [ ] **Očekivano:** Save dialog se otvara
- [ ] Sačuvaj fajl
- [ ] Otvori PDF i proveri:
  - Header logo prikazan
  - Footer logo prikazan (centriran, na dnu)
  - Tabela sa zaduženjima

### Test 10: Export iz Magacina
- [ ] Otvori "Magacin" tab → "Stanje"
- [ ] Klikni "Izvezi" dugme
- [ ] Izaberi "Excel tabela"
- [ ] **Očekivano:** Save dialog se otvara
- [ ] Sačuvaj fajl
- [ ] Otvori Excel i proveri:
  - Sheet "Stanje magacina" sa svim artiklima
  - Kolone: Naziv, Kat.broj, Kat.broj proizvođača, **Proizvođač**, Stanje, M.j., Min.količina, **Nabavna cena**, **Prodajna cena**
  - Sheet "Kritično stanje" (ako ima artikala ispod minimuma)

### Test 11: Word export
- [ ] Izvezi izveštaj iz Dashboard-a u Word formatu
- [ ] Otvori Word fajl
- [ ] Proveri da li sadrži tabelu sa zaduženjima

---

## Korak 4: Provera konzole za greške

Tokom testiranja, prati konzolu (DevTools) za:
- ❌ Greške (errors)
- ⚠️ Upozorenja (warnings)
- ✅ Uspešne poruke (success)

**Česte greške na Windows-u:**
- Path separator problemi (\ vs /)
- File permission problemi
- Font rendering problemi u PDF-u
- Excel binary module problemi

---

## Korak 5: Build (samo ako su svi testovi prošli)

```bash
npm run tauri:build
```

**Očekivani rezultat:**
- Build prolazi bez grešaka
- `.msi` fajl se kreira u: `src-tauri\target\release\bundle\msi\`

### Test build-ovanog .msi fajla
- [ ] Instaliraj .msi fajl
- [ ] Pokreni aplikaciju
- [ ] Ponovi testove 1-11 (samo ključne)

---

## Korak 6: Dokumentuj rezultate

**Ako SVE radi:**
✅ Javi da sve prolazi → kreiramo GitHub Release

**Ako NEŠTO ne radi:**
❌ Dokumentuj koje testove ne prolazi:
- Koji test broj?
- Koja greška se prikazuje?
- Screenshot greške iz konzole
- Screenshot UI problema

---

## Dodatni testovi (opciono)

### Test sa .xlsx fajlom
- [ ] Konvertuj `lager.xls` u `lager.xlsx`
- [ ] Testiraj import sa `.xlsx` verzijom
- [ ] Proveri da li rezultati isti kao sa `.xls`

### Test sa praznim poljima
- [ ] Kreiraj test Excel sa nekim praznim poljima (npr. bez proizvođača)
- [ ] Importuj
- [ ] Proveri da li aplikacija ignoriše prazna polja (ne crashuje)

### Test ažuriranja postojećeg artikla
- [ ] Importuj isti Excel fajl dva puta
- [ ] **Očekivano:** Drugi import ažurira postojeće artikle (po SKU)
- [ ] Proveri da li se podaci ažuriraju, a ne dupliraju

---

## Kontakt za pomoć

Ako naiđeš na probleme:
- Screenshot greške
- Tekst greške iz konzole
- Korak gde se desila greška

Javi mi rezultate testiranja pa nastavljamo sa cross-platform update sistemom! 🚀

