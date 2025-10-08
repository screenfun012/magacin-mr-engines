# Magacin App

Moderna desktop aplikacija za upravljanje magacinom, razvijena sa Tauri v2, React, SQLite i shadcn/ui.

## 🚀 Karakteristike

- **Desktop aplikacija** - Windows, macOS i Linux podrška
- **Offline-first** - Lokalna SQLite baza podataka
- **Auto-update** - Automatska provera i instalacija ažuriranja
- **Robustan UI/UX** - Moderan interfejs sa dark/light modom
- **Transakcioni sistem** - Tačno praćenje stanja i zaduženja
- **Audit trail** - Kompletna istorija svih izmena
- **Multi-user** - Admin i korisničke uloge

## 📋 Funkcionalnosti

### Dashboard
- Pregled zaduženja po radnicima (mesečni pogled)
- Kalendar picker za filtriranje po mesecu
- Inline edit količina sa promena boje (zeleno → narandžasto)
- Tooltip sa istorijom izmena
- Confirm dialog za brisanje zaduženja
- Toast notifikacije (zeleno/narandžasto/crveno)

### Magacin
- **Dodavanje robe**: Novi artikli ili dopuna postojećih
- **Izdavanje robe**: Zaduženje artikala radnicima
- **Vraćanje robe**: Povraćaj zaduženih artikala
- **Minimalne količine**: Automatski alerti i lista za poručivanje
- **Validacije**: Provera stanja, transakciona bezbednost

### Admin Panel
- **Statistika**: Pie i bar grafikoni po odeljenjima i artiklima
- **Radnici**: CRUD operacije, aktivacija/deaktivacija
- **Odeljenja**: Upravljanje organizacionim jedinicama
- **Logovi**: Filterabilni audit trail svih događaja
- **Podešavanja**: App info, provera i instalacija ažuriranja

### Export (stub)
- Pripremljeni interfejsi za CSV/XLSX/PDF export
- Arhitekturalno spreman za buduću implementaciju

## 🛠️ Tehnologije

- **Frontend**: React 18, Vite
- **Desktop**: Tauri v2
- **Baza**: SQLite (`@tauri-apps/plugin-sql`)
- **UI Framework**: shadcn/ui + TailwindCSS
- **State Management**: Zustand + TanStack Query
- **Ikonice**: lucide-react
- **Grafikoni**: Recharts
- **Auto-update**: `@tauri-apps/plugin-updater`

## 📦 Instalacija

### Preduslov i

- Node.js 18+ i npm/yarn
- Rust (za Tauri build)
- Tauri CLI

### Instalacija Rust-a

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Preuzmite rustup-init.exe sa https://rustup.rs/
```

### Instalacija dependenc ija

```bash
cd magacin-app
npm install
```

## 🚀 Pokretanje

### Development mode

```bash
npm run tauri:dev
```

Ova komanda:
1. Pokreće Vite dev server (http://localhost:1420)
2. Kompajlira Tauri aplikaciju
3. Otvara desktop prozor sa hot-reload funkcionalnostima

### Build za produkciju

```bash
npm run tauri:build
```

Build artefakti:
- **Windows**: `.msi` ili `.exe` u `src-tauri/target/release/bundle/`
- **macOS**: `.dmg` u `src-tauri/target/release/bundle/`
- **Linux**: `.AppImage`, `.deb` u `src-tauri/target/release/bundle/`

## 🗄️ Šema baze

SQLite baza se automatski kreira pri prvom pokretanju sa sledećim tabelama:

- `departments` - Odeljenja
- `workers` - Radnici
- `items` - Artikli
- `stock_balances` - Trenutna stanja
- `stock_ledger` - Transakcioni dnevnik
- `issues` - Zaduženja
- `issue_history` - Istorija izmena zaduženja
- `users` - Korisnici
- `logs` - Audit logovi

## 👤 Demo pristup

Nakon prvog pokretanja, baza se seeduje sa demo podacima:

- **Admin**: `admin` / `admin123`
- **Radnik**: `radnik1` / `user123`

## 🎨 Brand boje

Aplikacija koristi definisanu paletu:

- **Crna** (`--brand-black`): #000000
- **Crvena** (`--brand-red`): #DC2626
- **Siva** (`--brand-gray`): #6B7280
- **Bela** (`--brand-white`): #FFFFFF

## 📝 Use-case scenario (test)

### Scenario izdavanja i korigovanja:

1. Uvezen artikal X = 10 kom
2. Zaduži se radniku Pera Perić = 5 kom → stanje: 10 → 5
3. Koriguj zaduženje na 6 kom → stanje: 5 → 4
4. Proveri:
   - Magacin stanje = 4 kom
   - Zaduženje Pere = 6 kom
   - Količina u Dashboardu = narandžasta (izmenjena)
   - Tooltip prikazuje istoriju izmene
   - Stock ledger ima dva unosa: ISSUE (-5) i EDIT_ISSUE (-1)

## 🔒 Bezbednost

- Lozinke heširane sa bcrypt
- SQL transakcije za kritične operacije
- Foreign key constrainti
- Audit trail svih akcija
- Role-based access control (admin/user)

## 🔄 Auto-update

Aplikacija automatski proverava ažuriranja pri startu. Admin može ručno pokrenuti proveru u **Admin Panel → Podešavanja**.

**Konfiguracija** (`src-tauri/tauri.conf.json`):
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": ["https://your-update-server.com/..."],
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

Za produkciju:
1. Generiši key pair za potpis
2. Postavi update server
3. Ažuriraj `endpoints` i `pubkey`

## 📂 Struktura projekta

```
magacin-app/
├── src/
│   ├── components/        # Reusable UI komponente
│   │   └── ui/            # shadcn/ui komponente
│   ├── features/          # Feature moduli
│   │   ├── dashboard/     # Dashboard modul
│   │   ├── inventory/     # Magacin modul
│   │   ├── issues/        # Zaduženja modul
│   │   ├── admin/         # Admin panel
│   │   └── export/        # Export (stub)
│   ├── lib/
│   │   ├── db/            # DB client, migrations, seed
│   │   ├── services/      # Business logic services
│   │   ├── state/         # Zustand stores
│   │   └── utils.js       # Utility funkcije
│   ├── App.jsx            # Root komponenta
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── src-tauri/             # Tauri Rust backend
│   ├── src/
│   │   └── main.rs        # Rust entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri konfiguracija
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🧪 Testiranje

Pre deployovanja, testirajte:

1. **Scenario izdavanja/vraćanja**: Proveri brojke u magacinu, zaduženjima, ledgeru
2. **Minimalne količine**: Dodaj stanje ispod minimuma, proveri alert
3. **Edit zaduženja**: Proveri promenu boje i tooltip
4. **Brisanje zaduženja**: Potvrdi vraćanje u magacin
5. **Admin funkcije**: CRUD radnika/odeljenja, filteri logova
6. **Auto-update**: Mock endpoint za test flow-a
7. **Dark/light mode**: Proveri temu u svim modulima
8. **Auth**: Admin pristup vs. user pristup

## 📄 Licenca

Proprietarna aplikacija za internu upotrebu.

## 🤝 Podrška

Za pitanja ili probleme, kontaktirajte development tim.

---

**Verzija**: 1.0.0
**Poslednje ažuriranje**: Oktobar 2025

