# Quick Start Guide - Magacin App

Brz vodič za pokretanje aplikacije za prvi put.

## Korak 1: Provera preduslova

Trebate instalirati:
- **Node.js 18+** → https://nodejs.org/
- **Rust** → https://rustup.rs/

## Korak 2: Setup

### Linux/macOS

```bash
cd magacin-app
./scripts/setup.sh
```

### Windows (PowerShell)

```powershell
cd magacin-app
.\scripts\setup.ps1
```

### Ili ručno

```bash
npm install
cd src-tauri
cargo build
cd ..
```

## Korak 3: Pokretanje

```bash
npm run tauri:dev
```

**Napomena**: Prvo pokretanje može potrajati 5-10 minuta jer se kompajliraju Rust dependencije!

## Korak 4: Login

Login ekran će se automatski otvoriti. Koristite:

- **Admin**: `admin` / `admin123`
- **Radnik**: `radnik1` / `user123`

## Korak 5: Istražite aplikaciju

### Dashboard
- Pregled zaduženja po radnicima
- Kalendar picker za izbor meseca
- Kliknite Edit za izmenu količine
- Hover nad količinom za istoriju izmena

### Magacin
- **Stanje**: Pregled svih artikala
- **Dodaj robu**: Kreiraj novi artikal ili dopuni postojeći
- **Izdaj robu**: Zaduži artikal radniku
- **Vrati robu**: Povraćaj zadužene robe
- **Za poručivanje**: Artikli ispod minimuma

### Admin Panel (samo za admin korisnika)
- **Statistika**: Grafikoni po odeljenjima
- **Radnici**: CRUD operacije
- **Odeljenja**: CRUD operacije
- **Logovi**: Audit trail svih događaja
- **Podešavanja**: App info i update checker

## Testiranje use-case scenarija

### Scenario 1: Izdavanje i izmena zaduženja

1. Idi na **Magacin → Stanje**
2. Nađi artikal sa dovoljno stanja (npr. "Zaštitne rukavice" = 95 kom)
3. Idi na **Magacin → Izdaj robu**
4. Izaberi radnika i artikal, unesi količinu (npr. 5), klikni "Izdaj robu"
5. Idi na **Dashboard**
6. Nađi novoprikazano zaduženje (količina zelena)
7. Klikni Edit, promeni količinu (npr. sa 5 na 7), sačuvaj
8. Količina prelazi u narandžastu boju
9. Hover nad količinom → prikazuje se tooltip sa istorijom izmene
10. Idi na **Magacin → Stanje** → proveri da je stanje tačno
11. Idi na **Admin Panel → Logovi** → proveri da postoje zapisi za ISSUE i EDIT_ISSUE

### Scenario 2: Minimalne količine

1. Idi na **Magacin → Stanje**
2. Nađi artikal sa niskim stanjem (npr. "Ulje za mašine" = 5 l, min = 10)
3. Idi na **Magacin → Za poručivanje**
4. Artikal bi trebao biti prikazan sa crvenim badge-om "Nisko"

### Scenario 3: Vraćanje robe

1. Idi na **Magacin → Vrati robu**
2. Izaberi radnika koji ima zaduženje
3. Izaberi artikal i količinu za vraćanje (≤ zaduženo)
4. Klikni "Vrati robu"
5. Proveri da je stanje u magacinu ažurirano
6. Proveri da je zaduženje smanjeno ili obrisano u Dashboardu

## Build za produkciju

```bash
npm run tauri:build
```

Instaler fajlovi će biti u:
- `src-tauri/target/release/bundle/`

## Pomoć

Ako nešto ne radi:

1. Proveri da li su Node.js i Rust instalirani (`node --version`, `cargo --version`)
2. Pokreni `npm install` ponovo
3. Obriši `node_modules` i `src-tauri/target`, pa pokreni setup ponovo
4. Proveri da li postoje greške u terminalu/command promptu

Za detaljnije instrukcije, vidi:
- **README.md** - Generalni pregled
- **INSTALL.md** - Detaljne instalacijske instrukcije
- **VALIDATIONS.md** - Business rules i use-case scenariji
- **PROJECT_OVERVIEW.md** - Tehnički pregled projekta

---

Srećno korišćenje! 🚀

