# Release Notes - Verzija 1.0.0

**Datum izdavanja**: Oktobar 8, 2025  
**Kompanija**: MR Engines d.o.o.

---

## 🎉 Prva oficijalna verzija!

Ponosno predstavljamo **Magacin v1.0.0** - profesionalnu desktop aplikaciju za upravljanje magacinom izrađenu specifično za MR Engines d.o.o.

---

## ✨ Glavne funkcionalnosti

### 📦 Kompletan sistem za upravljanje magacinom

- Dodavanje i praćenje artikala sa kataloškim brojevima
- Automatsko praćenje minimalnih količina
- Real-time osvežavanje stanja (svakih 2 sekunde)
- Notifikacije za artikle sa niskim stanjem

### 👥 Evidencija radnika i odeljenja

- Organizacija radnika po odeljenjima
- Brzo pronalaženje i filtriranje
- Puna istorija zaduženja po radniku

### 🔄 Zaduženja i vraćanja

- Jednostavno zadužavanje materijala radnicima
- Vraćanje materijala nazad u magacin
- Automatsko ažuriranje količina
- Mesečni pregledi zaduženja

### 📊 Izveštaji i statistika

- Real-time dashboard sa ključnim metrikama
- Grafikoni distribucije po odeljenjima
- Top 10 najzadužavanijih artikala
- Detaljan pregled logova sistema

### 🎨 MR Engines brending

- Integrisani oficijalni logoi (veliki logo na loginu, mali logo u sidebar-u)
- MR logo kao desktop ikona aplikacije
- Brand boje (crvena, crna, siva)
- Profesionalan interfejs
- Tamna i svetla tema

---

## 🚀 Nove funkcionalnosti u v1.0.0

### Real-time ažuriranje

- Automatsko osvežavanje podataka svakih 2 sekunde
- Vizuelni indikator "Ažuriranje..." tokom sync-a
- Osvežavanje pri vraćanju fokusa na aplikaciju
- Optimistic updates za trenutni UI feedback

### Poboljšane notifikacije

- Toast notifikacije sa solidnim pozadinama
- Ikone za svaki tip notifikacije (success, warning, error)
- Automatsko zatvaranje nakon 3 sekunde
- Vidljivo X dugme za manualno zatvaranje

### Perzistencija podataka

- Trajno čuvanje svih podataka između sesija
- Verzioniranje baze podataka
- Automatski backup sistem
- SQLite baza za brzinu i pouzdanost

### Administratorski panel

- Upravljanje radnicima i odeljenjima
- Sistem za logove (svi eventi zabeleženi)
- Statistika i metrike
- Upravljanje korisnicima aplikacije

---

## 🛠️ Tehnička specifikacija

### Arhitektura

- **Frontend**: React 18.2 sa modernim hooks
- **UI Framework**: Tailwind CSS + Radix UI
- **Desktop Framework**: Tauri 2.0
- **Backend**: Rust
- **Baza podataka**: SQLite
- **State Management**: Zustand + React Query

### Performance

- Pokretanje: < 2 sekunde
- Real-time refresh: 2 sekunde
- Veličina aplikacije: ~15MB
- RAM korišćenje: ~100MB

### Sigurnost

- Lokalna baza podataka (offline)
- Korisnički pristup sa role-based permissions
- Logging svih akcija
- Zaštićene API rute

---

## 💾 Instalacija

### Podržane platforme

- ✅ **macOS** 10.13+ (Intel & Apple Silicon)
- ✅ **Windows** 10/11 (x64)
- ✅ **Linux** (Ubuntu 18.04+, Debian, Fedora)

### Instalacioni fajlovi

- macOS: DMG
- Windows: MSI / NSIS Installer
- Linux: AppImage / DEB

---

## 🔐 Default pristup

**Username**: `admin`  
**Password**: `admin123`

⚠️ **VAŽNO**: Promenite lozinku nakon prvog prijavljivanja!

---

## 📝 Inicijalno stanje

Aplikacija dolazi **POTPUONO PRAZNA** - spremna za produkciju:

- ✅ 1 admin korisnik (admin/admin123)
- ❌ **NEMA TEST PODATAKA** - potpuno clean aplikacija
- ❌ **NEMA DEMO RADNIKA** - dodajte svoje radnike
- ❌ **NEMA DEMO ARTIKALA** - dodajte svoje materijale
- ❌ **NEMA DEMO ODELJENJA** - kreirajte svoja odeljenja
- 🎯 **Spremno za vaše podatke** od prvog dana!

---

## 📚 Dokumentacija

Dostupni dokumenti u aplikaciji:

- `PRODUCTION_README.md` - Korisničko uputstvo
- `BUILD_INSTRUCTIONS.md` - Build upustva
- `DATABASE_INFO.md` - Informacije o bazi
- `BRANDING.md` - MR Engines brending
- `REAL_TIME_UPDATES.md` - Real-time funkcionalnost

---

## 🐛 Poznati problemi

### Verzija 1.0.0

- Nema poznatih kritičnih bug-ova
- macOS/Windows: Prvi pokretanje može prikazati sigurnosno upozorenje (aplikacija nije potpisan)
- Linux: AppImage zahteva execute permissions

### Workarounds

- **macOS**: System Preferences → Security & Privacy → Allow
- **Windows**: "More info" → "Run anyway"
- **Linux**: `chmod +x filename.AppImage`

---

## 🔮 Planirane funkcionalnosti (v1.1.0+)

- 📤 Export u Excel/PDF format
- 📧 Email notifikacije
- 📱 Responsive mobilni view (za tablet)
- 🔍 Napredna pretraga i filteri
- 📊 Dodatni izveštaji
- 🌐 Multi-language podrška
- 🔄 Automatsko ažuriranje aplikacije

---

## 🙏 Zahvalnice

Ova aplikacija je razvijena sa posebnom pažnjom za potrebe MR Engines d.o.o.

**Made with ❤️ in Serbia 🇷🇸**

---

## 📞 Podrška

Za tehničku podršku ili prijavu bug-ova, kontaktirajte IT odelјenje.

---

**© 2025 MR Engines d.o.o.**  
**Since 1968**  
**Sva prava zadržana**
