# Cross-Platform Update System - Implementacioni Plan

## 🎯 Cilj
Omogućiti automatski update sistem gde možeš sa Mac-a da build-uješ i push-uješ update-e za obe platforme (Windows i Mac), a aplikacije na oba sistema automatski preuzimaju i instaliraju nove verzije.

---

## 📋 Arhitektura

```
┌─────────────────┐
│   Mac (Dev)     │
│   - Build Mac   │
│   - Build Win   │  ────► GitHub Release ────┐
│   - Push update │                           │
└─────────────────┘                           │
                                              ▼
                            ┌────────────────────────────┐
                            │   GitHub Releases API      │
                            │   - Magacin_1.1.0.dmg     │
                            │   - Magacin_1.1.0.msi     │
                            │   - latest.json           │
                            └────────────────────────────┘
                                     │          │
                         ┌───────────┘          └───────────┐
                         ▼                                  ▼
              ┌─────────────────┐                ┌─────────────────┐
              │   Mac App       │                │   Windows App   │
              │   - Check API   │                │   - Check API   │
              │   - Download    │                │   - Download    │
              │   - Install     │                │   - Install     │
              └─────────────────┘                └─────────────────┘
```

---

## 🔧 Komponente sistema

### 1. **GitHub Releases** (Update Server)
- Besplatan hosting za build fajlove
- Automatski servira `latest.json` sa verzijom
- API endpoint: `https://api.github.com/repos/screenfun012/magacin-mr-engines/releases/latest`

### 2. **Tauri Updater**
- Built-in u Tauri
- Automatski detektuje OS i preuzima odgovarajući fajl (.dmg za Mac, .msi za Windows)
- Signature verifikacija za sigurnost

### 3. **Admin Panel UI**
- "Proveri za update" dugme
- Prikaz trenutne verzije
- Prikaz dostupne verzije
- "Instaliraj update" dugme
- Progress bar tokom preuzimanja

### 4. **GitHub Actions Workflow** (opciono)
- Automatski build za obe platforme na svakom push-u taga
- Automatsko kreiranje GitHub Release

---

## 📝 Implementacija - Faza po Faza

### **FAZA 1: Tauri Updater Konfiguracija**

#### 1.1. Generisanje RSA keypair za signature
Na Mac-u (za signing update-a):
```bash
cd /Users/nikola/magacin-app
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

#### 1.2. Ažuriranje `tauri.conf.json`
```json
{
  "version": "1.1.0",
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/screenfun012/magacin-mr-engines/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "PASTE_PUBLIC_KEY_HERE"
    }
  }
}
```

#### 1.3. Dodati permissions u `tauri.conf.json`
```json
"permissions": [
  "core:default",
  "sql:default",
  "sql:allow-load",
  "sql:allow-execute",
  "sql:allow-select",
  "dialog:allow-save",
  "fs:allow-write",
  "updater:default",
  "updater:allow-check",
  "updater:allow-download",
  "updater:allow-install"
]
```

---

### **FAZA 2: Update UI u Admin Panelu**

#### 2.1. Kreirati `UpdateTab` komponentu
Lokacija: `src/features/admin/UpdateTab.jsx`

Funkcionalnosti:
- Prikaz trenutne verzije (iz `package.json` ili `tauri.conf.json`)
- "Proveri za update" dugme
- Prikaz dostupne verzije (ako postoji)
- Prikaz release notes
- "Instaliraj update" dugme
- Progress bar tokom preuzimanja
- Restart dugme nakon instalacije

#### 2.2. Integracija sa `updateService.js`
Proširiti postojeći `updateService.js`:
```javascript
import { check, download, install } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForUpdates() {
  const update = await check();
  
  if (update?.available) {
    return {
      available: true,
      currentVersion: update.currentVersion,
      version: update.version,
      date: update.date,
      body: update.body,
    };
  }
  
  return { available: false };
}

export async function downloadAndInstallUpdate(onProgress) {
  const update = await check();
  
  if (!update?.available) {
    throw new Error('No update available');
  }
  
  await update.downloadAndInstall((progress) => {
    if (onProgress) {
      onProgress({
        downloaded: progress.chunkLength,
        total: progress.contentLength,
      });
    }
  });
  
  await relaunch();
}
```

---

### **FAZA 3: Cross-Platform Build Proces**

#### 3.1. Windows Build sa Mac-a (Cross-compilation)

**Instalacija Rust Windows target-a na Mac-u:**
```bash
rustup target add x86_64-pc-windows-msvc
```

**Instalacija dodatnih alata:**
```bash
brew install mingw-w64
cargo install cargo-xwin
```

**Build Windows verzije sa Mac-a:**
```bash
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

**Alternativa:** Koristi Windows mašinu za build:
```bash
# Na Windows mašini
npm run tauri:build
```

#### 3.2. Mac Build
```bash
# Na Mac-u
npm run tauri:build
```

---

### **FAZA 4: GitHub Release Workflow**

#### 4.1. Manualni Release Proces

**Korak 1: Ažuriraj verziju**
```bash
# Ažuriraj version u package.json i tauri.conf.json
npm version 1.1.0
```

**Korak 2: Build obe platforme**
```bash
# Mac build
npm run tauri:build

# Windows build (na Windows mašini ili cross-compile)
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

**Korak 3: Sign build-ove**
```bash
# Sign Mac .dmg
tauri signer sign --private-key ./private_key.pem \
  ./src-tauri/target/release/bundle/dmg/*.dmg

# Sign Windows .msi
tauri signer sign --private-key ./private_key.pem \
  ./src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi
```

**Korak 4: Kreiraj GitHub Release**
```bash
# Tag verziju
git tag v1.1.0
git push origin v1.1.0

# Idi na GitHub → Releases → Draft a new release
# - Izaberi tag: v1.1.0
# - Upload:
#   - Magacin_1.1.0_aarch64.dmg (Mac)
#   - Magacin_1.1.0_x64.msi (Windows)
#   - Magacin_1.1.0_aarch64.dmg.sig (signature)
#   - Magacin_1.1.0_x64.msi.sig (signature)
```

**Korak 5: Kreiraj `latest.json`**
```json
{
  "version": "1.1.0",
  "notes": "Nova verzija sa Excel import-om i novim poljima",
  "pub_date": "2025-11-05T13:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "PASTE_MAC_SIGNATURE_HERE",
      "url": "https://github.com/screenfun012/magacin-mr-engines/releases/download/v1.1.0/Magacin_1.1.0_aarch64.dmg"
    },
    "windows-x86_64": {
      "signature": "PASTE_WINDOWS_SIGNATURE_HERE",
      "url": "https://github.com/screenfun012/magacin-mr-engines/releases/download/v1.1.0/Magacin_1.1.0_x64.msi"
    }
  }
}
```

Upload `latest.json` kao Release asset.

---

#### 4.2. Automatski Release Proces (GitHub Actions)

**Kreirati `.github/workflows/release.yml`:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Tauri app
        run: npm run tauri:build
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
      
      - name: Upload Release Asset
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/*/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Dodaj secret na GitHub:**
- Idi na GitHub Repo → Settings → Secrets → New repository secret
- Name: `TAURI_PRIVATE_KEY`
- Value: Sadržaj `private_key.pem` fajla

---

### **FAZA 5: Testiranje Update Procesa**

#### Test 1: Kreiranje test release-a
1. Kreiraj tag `v1.0.1-test`
2. Build obe verzije
3. Kreiraj GitHub Release
4. Upload build-ove i `latest.json`

#### Test 2: Provera update-a na Mac-u
1. Instaliraj stariju verziju (v1.0.0)
2. Pokreni aplikaciju
3. Idi u Admin Panel → Update
4. Klikni "Proveri za update"
5. **Očekivano:** Prikazuje v1.0.1-test kao dostupan
6. Klikni "Instaliraj update"
7. **Očekivano:** Preuzima, instalira, restartuje aplikaciju
8. **Očekivano:** Nova verzija (v1.0.1-test) je instalirana

#### Test 3: Provera update-a na Windows-u
Ponovi Test 2 na Windows mašini.

---

## 🚀 Sledeći Koraci

### **Sada (odmah):**
1. ✅ Kod push-ovan na GitHub
2. ⏳ **Čeka se:** Testiranje na Windows mašini (vidi `WINDOWS_TEST_CHECKLIST.md`)

### **Nakon uspešnog Windows testa:**
1. Build Windows .msi verziju
2. Kreiraj GitHub Release v1.1.0 sa oba build-a
3. Implementiraj Update UI u Admin panelu
4. Konfiguriši Tauri updater
5. Testiraj update proces na obe platforme

### **Opciono (kasnije):**
1. Setup GitHub Actions za automatski build
2. Setup automatski test suite
3. Setup staging environment za test release-ove

---

## 📚 Dokumentacija i Resursi

- **Tauri Updater:** https://v2.tauri.app/plugin/updater/
- **GitHub Releases API:** https://docs.github.com/en/rest/releases
- **Cross-compilation:** https://v2.tauri.app/develop/building/#cross-platform-compilation
- **Signing:** https://v2.tauri.app/distribute/sign/

---

## ⚠️ Važne Napomene

1. **Private key sigurnost:**
   - NIKAD ne commit-uj `private_key.pem` u Git
   - Čuvaj ga na sigurnom mestu
   - Backup na USB ili cloud (enkriptovano)

2. **Verzionisanje:**
   - Uvek ažuriraj verziju u `package.json` I `tauri.conf.json`
   - Koristi semantic versioning (1.0.0, 1.1.0, 2.0.0)

3. **Testing:**
   - UVEK testiraj update na staging release-u pre production-a
   - Testiraj obe platforme

4. **Rollback:**
   - GitHub Releases omogućava rollback na stariju verziju
   - Samo označi stariju verziju kao "latest"

---

## 🎉 Prednosti ovog sistema

✅ **Sa Mac-a kontrolišeš obe platforme:**
- Build-uješ Windows i Mac verzije
- Push-uješ update-e za obe platforme
- Korisnici automatski dobijaju update-e

✅ **Sigurnost:**
- Signature verifikacija svake verzije
- HTTPS download sa GitHub-a

✅ **Jednostavnost:**
- GitHub Releases - besplatan hosting
- Tauri Updater - built-in funkcionalnost
- Nema potrebe za custom server-om

✅ **User Experience:**
- Jedan klik za proveru update-a
- Jedan klik za instalaciju
- Automatski restart nakon instalacije

---

**Sledeći korak:** Testiraj na Windows mašini, pa nastavljamo sa implementacijom! 🚀

