# Changelog

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.

## [1.0.0] - 2025-10-06

### Dodato
- Inicijalno izdanje Magacin App desktop aplikacije
- Dashboard modul sa mesečnim pregledima zaduženja
- Magacin modul sa CRUD operacijama za artikle
- Izdavanje i vraćanje robe radnicima
- Automatsko praćenje minimalnih količina
- Admin panel sa statistikama i grafikonima
- CRUD za radnike i odeljenja
- Kompletni audit logovi sistema
- Dark/Light mode toggle
- Auto-update funkcionalnost
- SQLite lokalna baza podataka
- Transakcioni sistem sa potpunom konzistentnošću
- Seed podatke za demo pristup

### Karakteristike
- Tauri v2 desktop aplikacija
- React 18 + Vite
- shadcn/ui + TailwindCSS
- SQLite baza sa transakcijama
- Role-based pristup (admin/user)
- Responsive UI/UX
- Toast notifikacije
- Inline edit sa promena boja
- Tooltip sa istorijom izmena
- Recharts grafikoni

### Bezbednost
- bcrypt hash za lozinke
- SQL transakcije
- Foreign key constraints
- Audit trail
- RBAC

### Poznati problemi
- Export funkcionalnost je placeholder (planirano za v1.1)
- Update server još nije konfigurisan (placeholder u config)

## [Unreleased]

### Planirano za v1.1
- CSV/XLSX/PDF export funkcionalnosti
- Automatski periodični izveštaji
- Napredni filteri i pretraga
- Backup/restore funkcionalnost
- Multi-language podrška

