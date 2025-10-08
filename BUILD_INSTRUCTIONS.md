# Build upustva za Production verziju

## 🚀 Izrada finalne verzije aplikacije

### Pre build-a

Aplikacija je pripremljena za production:

- ✅ Test podaci uklonjeni
- ✅ Samo admin korisnik (admin/admin123)
- ✅ Prazna baza spremna za produkciju
- ✅ MR Engines brending i logo
- ✅ Real-time ažuriranje
- ✅ Toast notifikacije
- ✅ Perzistencija podataka

### Build komanda

```bash
npm run tauri:build
```

### Šta build pravi

Build proces kreira instalere za trenutni operativni sistem:

#### **macOS**

Lokacija: `src-tauri/target/release/bundle/`

Fajlovi:

- **DMG**: `src-tauri/target/release/bundle/dmg/Magacin - MR Engines_1.0.0_aarch64.dmg` (za Apple Silicon)
- **DMG**: `src-tauri/target/release/bundle/dmg/Magacin - MR Engines_1.0.0_x64.dmg` (za Intel Mac)
- **App Bundle**: `src-tauri/target/release/bundle/macos/Magacin - MR Engines.app`

#### **Windows**

Lokacija: `src-tauri/target/release/bundle/`

Fajlovi:

- **MSI Installer**: `src-tauri/target/release/bundle/msi/Magacin - MR Engines_1.0.0_x64_en-US.msi`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/Magacin - MR Engines_1.0.0_x64-setup.exe`

#### **Linux**

Lokacija: `src-tauri/target/release/bundle/`

Fajlovi:

- **AppImage**: `src-tauri/target/release/bundle/appimage/magacin-mr-engines_1.0.0_amd64.AppImage`
- **DEB**: `src-tauri/target/release/bundle/deb/magacin-mr-engines_1.0.0_amd64.deb`

### Trajanje build procesa

- **Prvo build-ovanje**: 10-20 minuta (zavisi od mašine)
- **Naknadna build-ovanja**: 2-5 minuta

### Build optimizacije

Build je već konfigurisan za:

- ✅ Minifikaciju JavaScript-a
- ✅ Tree-shaking (uklanjanje nekorišćenog koda)
- ✅ Optimizaciju Rust koda
- ✅ Kompresiju assets-a

### Nakon build-a

1. **Testirajte** instaliranu aplikaciju
2. **Proverite** da li logo radi
3. **Prijavite se** sa admin/admin123
4. **Kreirajte** test odeljenje, radnika, materijal
5. **Zatvorite i ponovo pokrenite** - podaci treba da ostanu

### Distribucija

#### **macOS DMG**

- Jednostavno podelite DMG fajl
- Korisnici ga otvaraju i prevlače app u Applications folder
- **Napomena**: App nije potpisan - korisnici će morati da idu u System Preferences > Security & Privacy da dozvole otvaranje

#### **Windows MSI/EXE**

- Podelite MSI ili NSIS installer
- Double-click za instalaciju
- **Napomena**: Windows Defender može prikazati upozorenje jer app nije potpisan

#### **Linux AppImage/DEB**

- AppImage: Dodeli execute permissions (`chmod +x`) i pokreni
- DEB: Instaliraj sa `sudo dpkg -i filename.deb`

## 📝 Signing (opciono)

Za profesionalnu distribuciju, trebalo bi potpisati aplikaciju:

### macOS

- Apple Developer ID Certificate
- `codesign` i `notarization`

### Windows

- Code Signing Certificate
- `signtool` za potpis

### Linux

- Obično nije potrebno

## 🔧 Troubleshooting

### Build fails

```bash
# Očisti build cache
rm -rf src-tauri/target
npm run tauri:build
```

### Out of memory

```bash
# Povećaj Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run tauri:build
```

### Rust kompajliranje sporo

- Normalno za prvi build
- Kasnije builds su brže zbog inkrementalnog kompajliranja

## 📦 Fajl veličine

Očekivane veličine:

- **macOS DMG**: ~15-20 MB
- **Windows MSI**: ~10-15 MB
- **Linux AppImage**: ~15-20 MB

## ✅ Finalna provera lista

Pre distribucije, proverite:

- [ ] Build uspešno završen
- [ ] Aplikacija se pokreće sa MR Engines logoom u dock-u
- [ ] MR Engines logo se prikazuje na login stranici
- [ ] Login radi sa admin/admin123
- [ ] **Aplikacija dolazi potpuno prazna** - nema test podataka
- [ ] Možete kreirati odeljenja od nule
- [ ] Možete dodati radnike od nule
- [ ] Možete dodati materijale od nule
- [ ] Možete zadužiti materijale
- [ ] Podaci ostaju nakon restart-a
- [ ] Toast notifikacije rade
- [ ] Real-time ažuriranje radi
- [ ] Version broj je tačan (1.0.0)

---

**Verzija**: 1.0.0  
**Datum**: Oktobar 8, 2025  
**Kompanija**: MR Engines d.o.o.
