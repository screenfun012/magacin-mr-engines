# Update System Guide - v1.2.0

## 🎉 Šta je novo u v1.2.0

**AUTOMATSKI UPDATE SISTEM JE SADA AKTIVAN!**

### Nova funkcionalnost:
- ✅ **Update Tab u Admin Panelu** - "Proveri za update" dugme
- ✅ **Automatsko preuzimanje** - Update se preuzima sa GitHub Releases
- ✅ **Progress indicator** - Prikazuje napredak preuzimanja
- ✅ **Jedan klik instalacija** - Update se instalira automatski
- ✅ **Restart dugme** - Automatski restart nakon instalacije
- ✅ **Cross-platform** - Radi na Windows-u i Mac-u

---

## 🚀 Kako funkcioniše?

### Workflow:

```
1. Korisnik otvara aplikaciju (v1.2.0)
   ↓
2. Admin Panel → "Ažuriranja" tab
   ↓
3. Klikne "Proveri za update"
   ↓
4. Aplikacija proverava GitHub Releases API
   ↓
5. Ako postoji nova verzija (npr. v1.3.0):
   - Prikazuje verziju
   - Prikazuje release notes
   - Dugme "Instaliraj update"
   ↓
6. Klikne "Instaliraj update"
   ↓
7. Progress bar prikazuje preuzimanje (0% → 100%)
   ↓
8. Update se instalira automatski
   ↓
9. Klikne "Restartuj aplikaciju"
   ↓
10. Aplikacija se restartuje sa novom verzijom ✅
```

---

## 📋 Proces release-a (za developera)

### **Korak 1: Priprema nove verzije**

```bash
# 1. Ažuriraj version broj
# package.json: "version": "1.3.0"
# tauri.conf.json: "version": "1.3.0"
# updateService.js: getCurrentVersion() return '1.3.0'

# 2. Commit izmene
git add .
git commit -m "feat: nova funkcionalnost v1.3.0"
git push origin main

# 3. Kreiraj tag
git tag v1.3.0
git push origin v1.3.0
```

### **Korak 2: Build obe platforme**

**Na Mac-u:**
```bash
npm run tauri:build
# Fajl: src-tauri/target/release/bundle/dmg/*.dmg
```

**Na Windows-u:**
```bash
npm run tauri:build
# Fajl: src-tauri/target/release/bundle/msi/*.msi
```

### **Korak 3: Kreiranje GitHub Release**

1. Idi na GitHub → Releases → Draft a new release
2. Izaberi tag: `v1.3.0`
3. Title: `v1.3.0 - [Kratak opis]`
4. Description (Release notes):
   ```markdown
   ## Šta je novo u v1.3.0
   
   - Nova funkcionalnost 1
   - Nova funkcionalnost 2
   - Bugfix 1
   
   ## Instalacija
   
   **Windows:** Preuzmi `.msi` fajl
   **Mac:** Preuzmi `.dmg` fajl
   ```

5. Upload fajlove:
   - `Magacin-MR-Engines_1.3.0_x64-setup.msi` (Windows)
   - `Magacin - MR Engines_1.3.0_aarch64.dmg` (Mac)

6. Kreiraj `latest.json`:
   ```json
   {
     "version": "1.3.0",
     "notes": "Nova verzija sa...",
     "pub_date": "2025-11-05T15:00:00Z",
     "platforms": {
       "windows-x86_64": {
         "url": "https://github.com/screenfun012/magacin-mr-engines/releases/download/v1.3.0/Magacin-MR-Engines_1.3.0_x64-setup.msi"
       },
       "darwin-aarch64": {
         "url": "https://github.com/screenfun012/magacin-mr-engines/releases/download/v1.3.0/Magacin - MR Engines_1.3.0_aarch64.dmg"
       }
     }
   }
   ```

7. Upload `latest.json` kao Release asset
8. Označi kao "Latest release"
9. Publish release

---

## 🔐 Sigurnost

### RSA Keypair:
- **Private key:** `private_key.pem` (NIKAD NE COMMIT-OVATI!)
- **Public key:** Ugrađen u `tauri.conf.json`

### Signature verifikacija:
- Svaki update je potpisan sa private key-om
- Aplikacija verifikuje signature sa public key-om
- Onemogućava neovlašćene update-e

---

## 🧪 Testiranje Update Procesa

### **Test 1: Provera da update ne postoji**
1. Instaliraj v1.2.0
2. Proveri da je v1.2.0 latest na GitHub-u
3. Otvori Admin Panel → Ažuriranja
4. Klikni "Proveri za update"
5. **Očekivano:** "Nema dostupnih update-a"

### **Test 2: Provera da update postoji**
1. Instaliraj v1.2.0
2. Kreiraj GitHub Release v1.2.1 (test verzija)
3. Otvori Admin Panel → Ažuriranja
4. Klikni "Proveri za update"
5. **Očekivano:** Prikazuje v1.2.1 kao dostupnu

### **Test 3: Instalacija update-a**
1. U test-u 2, klikni "Instaliraj update"
2. **Očekivano:** Progress bar 0% → 100%
3. **Očekivano:** "Update instaliran!" poruka
4. Klikni "Restartuj aplikaciju"
5. **Očekivano:** Aplikacija se restartuje
6. **Očekivano:** Verzija je sada v1.2.1

---

## ⚠️ Važne Napomene

### **v1.1.0 → v1.2.0:**
- ❌ v1.1.0 NE MOŽE da se update-uje automatski
- ✅ v1.2.0 mora da se instalira **MANUALNO** (poslednji put)
- Razlog: v1.1.0 nema update funkcionalnost

### **v1.2.0 → v1.3.0+:**
- ✅ SVE buduće verzije se update-uju **AUTOMATSKI**
- ✅ Korisnik samo klikne "Proveri za update" → "Instaliraj"
- ✅ Nema više manuelnog preuzimanja

### **Backup:**
- Update NE BRIŠE podatke
- Database ostaje netaknut
- Ali preporučljivo je backup pre većih verzija

---

## 📚 Resursi

- **GitHub Repo:** https://github.com/screenfun012/magacin-mr-engines
- **Releases:** https://github.com/screenfun012/magacin-mr-engines/releases
- **Tauri Updater:** https://v2.tauri.app/plugin/updater/

---

## 🎯 Trenutna Verzija

**v1.2.0** - Prva verzija sa automatskim update sistemom

### Features:
- Excel import (.xls/.xlsx)
- Nova polja (prodajna cena, nabavna cena, proizvođač)
- Export funkcionalnost (PDF, Word, Excel)
- **AUTOMATSKI UPDATE SISTEM** ✨

---

**Sledeća verzija:** v1.3.0 (biće automatski update!)

