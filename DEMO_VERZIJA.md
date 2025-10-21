# 🎭 Magacin - MR Engines - DEMO VERZIJA

Build: **11. Oktobar 2025, 02:12**

---

## 🎯 Šta je DEMO verzija?

Ovo je **potpuno funkcionalna verzija aplikacije** sa **primerima podataka** koja omogućava:

- ✅ Testiranje svih funkcionalnosti
- ✅ Prikaz kako aplikacija radi sa pravim podacima
- ✅ Demonstraciju mogućnosti sistema
- ✅ Obuku korisnika pre prelaska na produkciju

---

## 📦 DEMO DMG Fajl - OTVOREN!

**Lokacija:**

```
/Users/nikola/magacin-app/src-tauri/target/release/bundle/dmg/Magacin - MR Engines DEMO_1.0.0-demo_aarch64.dmg
```

**Veličina:** 27 MB  
**Build:** 11. Oktobar 2025, 02:12  
**Verzija:** 1.0.0-demo

---

## 🎭 Šta uključuje DEMO verzija?

### 👤 **2 Korisnika:**

1. **Admin:** `admin / admin123` - pun pristup
2. **Radnik:** `radnik1 / radnik123` - ograničen pristup (bez Admin panela)

### 🏢 **3 Odeljenja:**

1. Proizvodnja
2. Održavanje
3. Administracija

### 👥 **6 Radnika:**

1. **Petar Petrović** (Proizvodnja)
2. **Marko Marković** (Proizvodnja)
3. **Jovan Jovanović** (Održavanje)
4. **Ana Anić** (Održavanje)
5. **Milan Milanović** (Administracija)
6. **Jovana Jović** (Administracija)

### 📦 **8 Artikala sa stanjem:**

1. **Zaštitne rukavice** (ZR-001) - 50 par (zaduženo: 2 → stanje: 48)
2. **Zaštitne naočare** (ZN-001) - 25 kom (zaduženo: 1 → stanje: 24)
3. **Motorno ulje 10W-40** (MU-001) - 100 l (zaduženo: 5 → stanje: 95)
4. **Zaštitni šlem** (ZS-001) - 15 kom (zaduženo: 1 → stanje: 14)
5. **A4 papir** (AP-001) - 20 pak (stanje: 20)
6. **Čelična žica 2mm** (CZ-002) - 45 kg (zaduženo: 3 → stanje: 42)
7. **Transmisioni kaiš** (TK-001) - 8 kom (stanje: 8)
8. **Radne cipele** (RC-001) - 12 par (zaduženo: 1 → stanje: 11)

### ✅ **6 Aktivnih zaduženja:**

1. Petar Petrović → Zaštitne rukavice (2 para)
2. Petar Petrović → Zaštitne naočare (1 kom)
3. Marko Marković → Zaštitni šlem (1 kom)
4. Jovan Jovanović → Motorno ulje (5 l)
5. Ana Anić → Čelična žica (3 kg)
6. Milan Milanović → Radne cipele (1 par)

---

## 🚀 **Instalacija DEMO verzije:**

### 1. **Instaliraj:**

- DMG je otvoren
- Prevuci **"Magacin - MR Engines DEMO"** u Applications
- Pokreni iz Applications foldera

### 2. **Prijavi se:**

**Admin pristup (sve funkcije):**

```
Username: admin
Password: admin123
```

**Radnik pristup (bez Admin panela):**

```
Username: radnik1
Password: radnik123
```

---

## 🎯 **Šta možeš testirati:**

### ✅ **Dashboard:**

- Vidi 6 aktivnih zaduženja
- Izmeni količinu zaduženja
- Obriši zaduženje (roba se vraća u magacin!)
- Pretraži zaduženja
- Filtruj po mesecu

### ✅ **Magacin:**

- **Stanje** - vidi 8 artikala sa različitim stanjima
- **Dodaj robu** - dopuni postojeći artikal
- **Dodaj robu** - kreiraj novi artikal
- **Obriši artikal** - sa popup potvrdom
- **Izdaj robu** - zaduži još jednom radniku
- **Vrati robu** - razduženje radnika
- **Za poručivanje** - vidi artikle ispod minimuma

### ✅ **Izvoz:**

- Export u Excel
- Filtriranje po periodu

### ✅ **Admin Panel** (samo kao admin):

- **Statistika:**
  - Moderna stat kartice
  - Zdravlje magacina sa progress bar-om
  - Grafikoni (pie, bar)
  - Lista kritičnih artikala
- **Radnici & Odeljenja:**
  - Dodaj novog radnika
  - Izmeni podatke
  - Dodaj novo odeljenje
- **Logovi:**
  - Kompletna istorija akcija
  - Lucide ikonice
  - Pretraga
- **Podesavanja:**
  - Dark/Light mode
  - App info

---

## 🎨 **Kako izgleda DEMO:**

### **Login ekran:**

- 🎭 **DEMO VERZIJA** badge (žuto-narandžasti)
- Prikazuje demo pristupne podatke
- Jasno označeno da je demo

### **Sidebar:**

- MR Engines logo
- Pun naziv: "Magacin - MR Engines DEMO"

### **Podaci:**

- Realni primeri (zaštitna oprema, alat, materijali)
- Srpska imena radnika
- Logična odeljenja

---

## 📊 **Primer korišćenja:**

### **Scenario 1: Pogledaj kako radi zaduženje**

1. Prijavi se kao **admin**
2. **Dashboard** - vidi Petar Petrović ima 2 zaduženja
3. **Magacin** → Izdaj robu → zaduži još nešto
4. Vrati se na **Dashboard** → vidi novo zaduženje ODMAH!

### **Scenario 2: Testiranje razduženja**

1. **Dashboard** → klikni korpu kod zaduženja
2. Popup → Potvrdi
3. ✅ Zaduženje nestaje
4. **Magacin** → Stanje → vidi da je roba vraćena!

### **Scenario 3: Statistika**

1. **Admin** → Statistika
2. Vidi moderne kartice sa podacima
3. Zdravlje magacina - progress bar
4. Grafikoni sa pravim podacima
5. Lista kritičnih artikala (ako ih ima)

---

## 🔄 **Razlika između DEMO i Production verzije:**

| Feature     | DEMO Verzija                          | Production Verzija    |
| ----------- | ------------------------------------- | --------------------- |
| Test podaci | ✅ 6 radnika, 8 artikala, 6 zaduženja | ❌ Potpuno prazno     |
| Login       | admin/admin123 ili radnik1/radnik123  | admin/admin123        |
| Oznaka      | 🎭 "DEMO VERZIJA" badge               | Nema oznake           |
| Identifier  | com.mrengines.magacin.demo            | com.mrengines.magacin |
| Svrha       | Demonstracija i testiranje            | Stvarno korišćenje    |

---

## 📁 **Instalacija obe verzije:**

**MOŽEŠ instalirati OBE verzije istovremeno!**

- DEMO koristi: `com.mrengines.magacin.demo`
- Production koristi: `com.mrengines.magacin`

**Različite baze:**

- DEMO: `~/Library/Application Support/com.mrengines.magacin.demo/app.db`
- Production: `~/Library/Application Support/com.mrengines.magacin/app.db`

---

## 🎉 **Svrha DEMO verzije:**

✅ **Obuka korisnika** - nauči kako radi sistem  
✅ **Testiranje workflow-a** - isprobaj sve funkcije  
✅ **Prezentacija klijentu** - pokaži mogućnosti  
✅ **Dokumentacija** - kako koristiti svaku funkciju  
✅ **Sigurno testiranje** - bez straha od grešaka

---

## 📦 **OBE VERZIJE DOSTUPNE:**

### 🎭 **DEMO Verzija (sa primerima):**

```
/Users/nikola/magacin-app/src-tauri/target/release/bundle/dmg/Magacin - MR Engines DEMO_1.0.0-demo_aarch64.dmg
```

**Build:** 11. Oktobar 2025, 02:12

### 🏭 **Production Verzija (prazna baza):**

```
/Users/nikola/magacin-app/src-tauri/target/release/bundle/dmg/Magacin - MR Engines_1.0.0_aarch64.dmg
```

**Build:** 10. Oktobar 2025, 01:27

---

## ✅ **STATUS:**

**🎭 DEMO VERZIJA - SPREMNA ZA TESTIRANJE!**

**🏭 PRODUCTION VERZIJA - SPREMNA ZA KORIŠĆENJE!**

---

**Razvio:** AI Assistant  
**Za:** MR Engines  
**Datum:** 11. Oktobar 2025
