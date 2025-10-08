# Magacin - MR Engines v1.0.0 🏭

## Desktop aplikacija za upravljanje magacinom

Profesionalna desktop aplikacija za evidenciju i zaduženja materijala, izrađena za **MR Engines d.o.o.**

---

## ✨ Karakteristike

### 📦 Upravljanje magacinom

- Dodavanje i praćenje artikala
- Kataloski brojevi i minimalne količine
- Real-time prikaz stanja
- Automatske notifikacije za nisko stanje

### 👥 Evidencija radnika

- Organizacija po odeljenjima
- Praćenje zaduženja po radnicima
- Istorija promena

### 📊 Zaduženja

- Brzo zadužavanje materijala
- Vraćanje materijala u magacin
- Mesečni pregledi
- Detaljna istorija izmena

### 📈 Izveštaji i statistika

- Dashboard sa real-time podacima
- Pregled po odeljenjima
- Analiza najpopularnijih artikala
- Export funkcionalnost

### 🔐 Sigurnost

- Korisnički pristup sa nivoima ovlašćenja
- Admin i User role
- Logovanje svih akcija

---

## 🚀 Instalacija

### Prvi put

1. **Preuzmite** odgovarajući installer za vaš sistem:

   - **macOS**: DMG fajl sa MR Engines logoom
   - **Windows**: MSI ili EXE installer sa MR Engines logoom
   - **Linux**: AppImage ili DEB paket sa MR Engines logoom

2. **Instalirajte** aplikaciju:

   - **macOS**: Otvorite DMG i prevucite app u Applications folder
   - **Windows**: Pokrenite installer i pratite korake
   - **Linux**: Dajte execute permissions (AppImage) ili instalirajte (DEB)

3. **Pokrenite** aplikaciju

4. **Prijavite se**:

   ```
   Username: admin
   Password: admin123
   ```

5. **⚠️ VAŽNO**: Promenite default lozinku nakon prvog prijavljivanja!

---

## 🎯 Prvo pokretanje - Setup

Aplikacija dolazi **potpuno prazna** (bez test podataka) - počnite sa podešavanjem:

### 1. Kreirajte odeljenja

`Admin Panel` → `Odeljenja` → `Dodaj odeljenje`

Primer: Proizvodnja, Održavanje, Administracija, itd.

### 2. Dodajte radnike

`Admin Panel` → `Radnici` → `Dodaj radnika`

Za svakog radnika unesite:

- Ime i prezime
- Odeljenje
- Status (aktivan/neaktivan)

### 3. Dodajte materijale

`Magacin` → `Dodaj robu` → `Novi artikal`

Za svaki artikal unesite:

- Naziv
- Kataloški broj
- Merna jedinica (kom, par, l, kg, etc.)
- Minimalna količina (za upozorenja)
- Početno stanje

### 4. Počnite sa zaduženjima

`Magacin` → `Izdaj robu`

Izaberite radnika, artikal i količinu.

---

## 📱 Interfejs

### Dashboard

- Pregled svih zaduženja
- Filtriranje po mesecu
- Pretraga radnika/materijala
- Statistike (ukupno zaduženja, radnika, artikala)

### Magacin

- **Stanje**: Trenutno stanje svih artikala
- **Dodaj robu**: Dodavanje novih artikala ili dopuna postojećih
- **Izdaj robu**: Zaduženje materijala radnicima
- **Vrati robu**: Vraćanje materijala u magacin
- **Za poručivanje**: Artikli sa niskim stanjem

### Admin Panel

- **Statistika**: Grafici i metrike
- **Radnici**: Upravljanje radnicima
- **Odeljenja**: Upravljanje odeljenjima
- **Logovi**: Pregled svih akcija u sistemu
- **Tim**: Upravljanje korisnicima aplikacije

---

## 💾 Podaci

### Lokacija baze podataka

Svi podaci se trajno čuvaju na:

- **macOS**: `~/Library/Application Support/com.mrengines.magacin/app.db`
- **Windows**: `%APPDATA%\com.mrengines.magacin\app.db`
- **Linux**: `~/.local/share/com.mrengines.magacin/app.db`

### Backup

Preporučujemo redovan backup baze podataka:

**macOS**:

```bash
cp ~/Library/Application\ Support/com.mrengines.magacin/app.db ~/Desktop/magacin-backup.db
```

**Windows** (PowerShell):

```powershell
Copy-Item "$env:APPDATA\com.mrengines.magacin\app.db" "$env:USERPROFILE\Desktop\magacin-backup.db"
```

---

## 🔄 Ažuriranje

Kada izađe nova verzija:

1. Preuzmite novu verziju
2. Zatvorite aplikaciju
3. Instalirajte novu verziju (preko stare)
4. Pokrenite aplikaciju
5. **Podaci se čuvaju** - ništa se ne briše!

---

## 🆘 Pomoć i podrška

### Često postavljana pitanja

**Q: Zaboravio sam lozinku?**  
A: Kontaktirajte administratora sistema ili pogledajte tehničku dokumentaciju za reset procedure.

**Q: Gde se čuvaju podaci?**  
A: Lokalno na vašem računaru u SQLite bazi. Pogledajte sekciju "Podaci" iznad.

**Q: Mogu li koristiti aplikaciju offline?**  
A: Da! Aplikacija je potpuno offline i ne zahteva internet konekciju.

**Q: Kako napravim backup?**  
A: Kopirajte fajl baze podataka sa lokacije navedene u sekciji "Podaci".

**Q: Podaci su mi nestali?**  
A: Proverite da li ste pokrenuli istu instalaciju. Različite instalacije imaju različite baze. Pogledajte folder sa bazom.

---

## 📋 Sistemski zahtevi

### Minimalni

- **OS**: Windows 10, macOS 10.13+, ili Ubuntu 18.04+
- **RAM**: 4GB
- **Prostor**: 100MB
- **Procesor**: Dual-core 1.5GHz

### Preporučeni

- **OS**: Windows 11, macOS 12+, ili Ubuntu 22.04+
- **RAM**: 8GB+
- **Prostor**: 500MB (sa backup-ima)
- **Procesor**: Quad-core 2.0GHz+

---

## 🏢 O aplikaciji

**Naziv**: Magacin - MR Engines  
**Verzija**: 1.0.0  
**Kompanija**: MR Engines d.o.o.  
**Godina**: 2025  
**Tehnologija**: Tauri + React + SQLite

### Funkcionalnosti

✅ Real-time ažuriranje podataka  
✅ Intuitivni korisničkih interfejs  
✅ Offline rad  
✅ Perzistentna baza podataka  
✅ Višenivoski korisnički pristup  
✅ Detaljan logging sistem  
✅ Izvozenje podataka  
✅ Responsivan dizajn  
✅ Tamna i svetla tema

---

## 📞 Kontakt

Za podršku, probleme ili predloge, kontaktirajte:

**MR Engines d.o.o.**  
Made in Serbia 🇷🇸  
Since 1968

---

**© 2025 MR Engines d.o.o. Sva prava zadržana.**
