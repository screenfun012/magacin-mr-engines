# Magacin App - Pregled projekta

## 📊 Statistika projekta

- **Broj fajlova**: ~80+
- **Linija koda**: ~7000+
- **Tehnologije**: 8+ glavnih
- **Komponente**: 30+ React komponenti
- **Database tabele**: 8
- **API servisi**: 6 glavnih servisa

## 🗂️ Struktura direktorijuma

```
magacin-app/
│
├── src/                              # Frontend React aplikacija
│   ├── components/                   # Reusable komponente
│   │   ├── ui/                       # shadcn/ui komponente (20+)
│   │   ├── Login.jsx                 # Login ekran
│   │   └── Sidebar.jsx               # Navigacija sidebar
│   │
│   ├── features/                     # Feature moduli (domain-driven)
│   │   ├── dashboard/                # Dashboard modul
│   │   │   └── Dashboard.jsx
│   │   ├── inventory/                # Magacin modul
│   │   │   └── Inventory.jsx
│   │   ├── issues/                   # Zaduženja (integrisano u Dashboard)
│   │   ├── admin/                    # Admin Panel
│   │   │   ├── Admin.jsx
│   │   │   ├── WorkersManagement.jsx
│   │   │   ├── DepartmentsManagement.jsx
│   │   │   ├── LogsViewer.jsx
│   │   │   ├── Statistics.jsx
│   │   │   └── AppSettings.jsx
│   │   └── export/                   # Export modul (stub)
│   │       └── Export.jsx
│   │
│   ├── lib/                          # Core libraries
│   │   ├── db/                       # Database layer
│   │   │   ├── client.js             # SQLite client wrapper
│   │   │   ├── migrations.js         # Schema migrations
│   │   │   ├── seed.js               # Seed data
│   │   │   └── schema.sql            # Raw SQL schema
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── authService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── issueService.js
│   │   │   ├── workerService.js
│   │   │   ├── logService.js
│   │   │   └── updateService.js
│   │   │
│   │   ├── state/                    # State management (Zustand)
│   │   │   ├── authStore.js
│   │   │   └── themeStore.js
│   │   │
│   │   └── utils.js                  # Utility functions
│   │
│   ├── App.jsx                       # Root component
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles + Tailwind
│
├── src-tauri/                        # Tauri Rust backend
│   ├── src/
│   │   └── main.rs                   # Rust entry point
│   ├── icons/                        # App icons (placeholder)
│   ├── Cargo.toml                    # Rust dependencies
│   ├── build.rs                      # Build script
│   └── tauri.conf.json               # Tauri configuration
│
├── public/                           # Static assets
│   └── vite.svg                      # Favicon
│
├── scripts/                          # Helper scripts
│   ├── setup.sh                      # Linux/macOS setup
│   └── setup.ps1                     # Windows PowerShell setup
│
├── .vscode/                          # VS Code config
│   ├── settings.json
│   └── extensions.json
│
├── package.json                      # npm dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── jsconfig.json                     # JavaScript config (@ alias)
├── .prettierrc                       # Prettier config
├── .eslintrc.cjs                     # ESLint config
├── .gitignore                        # Git ignore rules
│
├── README.md                         # Main documentation
├── INSTALL.md                        # Installation guide
├── VALIDATIONS.md                    # Business rules & validations
├── CHANGELOG.md                      # Version history
└── PROJECT_OVERVIEW.md               # This file
```

## 🔑 Ključne tehnologije

### Frontend
- **React 18**: UI library
- **Vite**: Build tool i dev server
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Radix UI**: Headless accessible components
- **lucide-react**: Icon library
- **Recharts**: Charting library

### State Management
- **Zustand**: Lightweight state management
- **TanStack Query (React Query)**: Server state management, caching, mutations

### Desktop & Backend
- **Tauri v2**: Rust-based desktop framework
- **SQLite**: Embedded database (`@tauri-apps/plugin-sql`)
- **Tauri Updater**: Auto-update functionality (`@tauri-apps/plugin-updater`)

### Utilities
- **date-fns**: Date formatting
- **bcryptjs**: Password hashing
- **class-variance-authority**: Component variant management
- **clsx + tailwind-merge**: Conditional className utilities

## 📦 Glavni moduli

### 1. Dashboard
**Funkcionalnosti:**
- Prikaz zaduženja po radnicima za izabrani mesec
- Kalendar picker za filtriranje
- Inline edit količina zaduženja
- Tooltip sa istorijom izmena (audit trail)
- Brisanje zaduženja sa confirm dialogom
- Toast notifikacije (zeleno, narandžasto, crveno)

**Komponente:**
- `Dashboard.jsx`: Glavni container
- `IssueRow.jsx`: Red u tabeli sa tooltip-om

**Servisi:**
- `issueService`: `getMonthlyIssues`, `updateIssueQty`, `deleteIssue`, `getIssueHistory`

---

### 2. Magacin (Inventory)

**Funkcionalnosti:**
- **Stanje**: Pregled svih artikala i trenutnih količina
- **Dodaj robu**: Kreiranje novog artikla ili dopuna postojećeg
- **Izdaj robu**: Zaduženje artikla radniku
- **Vrati robu**: Povraćaj zadužene robe u magacin
- **Za poručivanje**: Lista artikala ispod minimalne količine

**Komponente:**
- `Inventory.jsx`: Glavni container sa tabovima
- `StockTab`, `AddStockTab`, `IssueTab`, `ReturnTab`, `LowStockTab`

**Servisi:**
- `inventoryService`: `getAllItems`, `addItem`, `addStockToExistingItem`, `getLowStockItems`, `getStockLedger`
- `issueService`: `createIssue`, `returnIssue`
- `workerService`: `getAllWorkers`, `getAllDepartments`

---

### 3. Admin Panel

**Funkcionalnosti:**
- **Statistika**: Pie i bar grafikoni (zaduženja po odeljenjima i artiklima)
- **Radnici**: CRUD operacije, aktivacija/deaktivacija
- **Odeljenja**: CRUD operacije
- **Logovi**: Filterabilni audit trail
- **Podešavanja**: App info, provera ažuriranja, instalacija

**Komponente:**
- `Admin.jsx`: Container sa tabovima
- `Statistics.jsx`: Dashboards sa grafikonima (Recharts)
- `WorkersManagement.jsx`: CRUD za radnike
- `DepartmentsManagement.jsx`: CRUD za odeljenja
- `LogsViewer.jsx`: Tabela logova sa filterima
- `AppSettings.jsx`: App info, update checker

**Servisi:**
- `workerService`: CRUD operacije za radnike i odeljenja
- `logService`: `getLogs`, `getLogStats`
- `updateService`: `checkForUpdates`, `downloadAndInstallUpdate`, `restartApp`

---

### 4. Export (Stub)

**Funkcionalnosti:**
- Placeholder kartice za CSV, XLSX, PDF export
- Arhitekturalno pripremljen interfejs za buduću implementaciju

**Komponente:**
- `Export.jsx`: Disabled kartice sa "Coming soon" statusom

---

### 5. Auth sistem

**Funkcionalnosti:**
- Login ekran sa username/password
- Role-based access control (admin/user)
- Password hashing sa bcrypt
- Session management sa Zustand persist

**Komponente:**
- `Login.jsx`: Login forma
- `Sidebar.jsx`: Role-based filtering stavki menija

**Servisi:**
- `authService`: `loginUser`, `logAction`

**Store:**
- `authStore`: `login`, `logout`, `isAdmin`

---

### 6. Theme sistem

**Funkcionalnosti:**
- Light/Dark mode toggle
- Persisted u localStorage
- Dinamičko menjanje CSS classes

**Store:**
- `themeStore`: `toggleTheme`, `setTheme`

**UI:**
- Switch u Sidebar-u
- Brand boje prilagođene za oba moda

---

## 🗄️ Database šema (SQLite)

### Tabele

1. **departments**
   - `id`, `name`, `is_active`, `created_at`

2. **workers**
   - `id`, `first_name`, `last_name`, `department_id`, `is_active`, `created_at`
   - UNIQUE: `(first_name, last_name, department_id)`

3. **items**
   - `id`, `name`, `sku`, `manufacturer_sku`, `uom`, `min_qty`, `created_at`
   - UNIQUE: `(name, sku)`

4. **stock_balances**
   - `item_id` (PK), `qty_on_hand`

5. **stock_ledger**
   - `id`, `item_id`, `delta_qty`, `reason`, `actor_user_id`, `meta`, `created_at`
   - Reasons: `ADD_STOCK`, `ISSUE`, `RETURN`, `EDIT_ISSUE`, `DELETE_ISSUE`, `ADJUSTMENT`

6. **issues**
   - `id`, `item_id`, `worker_id`, `qty`, `issued_at`, `is_active`

7. **issue_history**
   - `id`, `issue_id`, `prev_qty`, `new_qty`, `actor_user_id`, `changed_at`

8. **users**
   - `id`, `username`, `password_hash`, `role`, `is_active`, `created_at`
   - Roles: `admin`, `user`

9. **logs**
   - `id`, `category`, `action`, `entity`, `entity_id`, `actor_user_id`, `payload`, `created_at`

### View-ovi

- **v_monthly_issues**: JOIN tabele za mesečni prikaz zaduženja

### Indeksi

- `idx_workers_department`, `idx_issues_item`, `idx_issues_worker`, `idx_issues_issued_at`
- `idx_stock_ledger_item`, `idx_stock_ledger_created_at`
- `idx_logs_category`, `idx_logs_created_at`, `idx_logs_actor`

---

## 🎨 UI/UX detalji

### shadcn/ui komponente korišćene

- `Button`, `Input`, `Label`, `Select`, `Card`, `Table`
- `Dialog`, `Tooltip`, `Toast`, `Tabs`, `Badge`, `Alert`
- `Calendar`, `Popover`, `Switch`, `Dropdown Menu`, `Separator`

### Brand paleta

- **Crna** (`#000000`): Text, borders, primarna
- **Crvena** (`#DC2626`): CTA dugmad, akcenti, grafikoni
- **Siva** (`#6B7280`): Sekundarna, muted text
- **Bela** (`#FFFFFF`): Background (light mode)

### Toast boje

- **Zeleno**: Uspešno dodavanje
- **Narandžasto**: Uspešno editovanje/upozorenja
- **Crveno**: Greške ili brisanje

---

## 🔒 Bezbednost

- **Password hashing**: bcrypt sa 10 rounds
- **SQL transakcije**: Atomicnost kritičnih operacija
- **Foreign keys**: Enforced constraints
- **Soft delete**: `is_active` flag umesto hard delete
- **Audit trail**: Svaka akcija logovana sa actor_user_id
- **RBAC**: Admin vs. User uloge

---

## 🚀 Build & Deploy

### Development

```bash
npm run tauri:dev
```

- Hot-reload React komponenti
- Tauri dev window
- SQLite baza u `AppData/Roaming/com.magacinapp.app/` (ili ekvivalent)

### Production

```bash
npm run tauri:build
```

- Optimizovan React build (Vite)
- Kompajliran Rust binary
- Installer fajlovi:
  - **Windows**: `.msi` ili `.exe`
  - **macOS**: `.dmg`
  - **Linux**: `.AppImage`, `.deb`

### Code signing (TODO)

- Windows: Certificat za signing
- macOS: Apple Developer ID + notarization
- Tauri podržava code signing kroz konfiguraciju

---

## 📈 Performance optimizacije

- **TanStack Query**: Caching server state, automatski refetch
- **Zustand persist**: LocalStorage za auth i theme
- **Debounced search**: (planirano za budućnost)
- **Virtuelizacija tabela**: (planirano za velike setove)
- **SQL indeksi**: Optimizovani query-ji za JOIN i WHERE

---

## 🧪 Testing strategy (planirano)

- **Unit tests**: Vitest za servise i utilities
- **Component tests**: React Testing Library
- **E2E tests**: Playwright ili Cypress
- **SQL tests**: Test database sa seed podacima

---

## 🔄 Auto-update flow

1. **Pri startu aplikacije**: Tiha provera ažuriranja u pozadini
2. **Ako postoji update**: Prikaži modal sa release notes
3. **Download**: Progress bar za preuzimanje
4. **Install**: Instalacija u pozadini
5. **Restart**: Dugme "Restart to update"

**Alternativno**: U Admin Panel → Podešavanja, admin može ručno pokrenuti proveru.

---

## 📚 Dodatna dokumentacija

- **README.md**: Generalni pregled, instalacija, pokretanje
- **INSTALL.md**: Detaljne instalacijske instrukcije po OS-u
- **VALIDATIONS.md**: Business rules, validacije, use-case scenariji
- **CHANGELOG.md**: Version history
- **PROJECT_OVERVIEW.md**: Ovaj fajl

---

## 🎯 Roadmap (buduće verzije)

### v1.1
- CSV/XLSX/PDF export funkcionalnosti
- Napredni filteri i pretraga
- Backup/restore funkcionalnost

### v1.2
- Multi-language podrška (EN, SR)
- Notifikacije za nisko stanje (desktop notifications)
- Automatski periodični izveštaji

### v1.3
- Barcode scanning integracija
- QR kod za artikle
- Stampanje nalepnica

### v2.0
- Cloud sync opcija (opciono)
- Multi-tenant podrška
- Web dashboard (read-only)

---

**Autor**: Development Team
**Verzija**: 1.0.0
**Datum**: Oktobar 2025
**Licenca**: Proprietary (interna upotreba)

