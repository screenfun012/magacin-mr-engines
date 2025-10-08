# Deployment Guide - Magacin App

Vodič za build, deployment i distribuciju aplikacije.

## Pre-deployment checklist

- [ ] Testirani svi use-case scenariji
- [ ] Proveren audit trail (logovi)
- [ ] Proveren auto-update flow
- [ ] Ikonice zamenjene sa pravim (trenutno su placeholder)
- [ ] Update server konfigurisan (trenutno je placeholder)
- [ ] Code signing sertifikati pribavljeni

## Build proces

### 1. Priprema

```bash
cd magacin-app

# Provera dependencija
npm install
npm audit fix

# Provera Rust dependencija
cd src-tauri
cargo update
cargo audit
cd ..
```

### 2. Verzionisanje

Ažuriraj verziju u:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `CHANGELOG.md`

```bash
# Primer
npm version 1.0.1
# ili ručno edituj fajlove
```

### 3. Production build

```bash
npm run tauri:build
```

Build artefakti se kreiraju u:
- `src-tauri/target/release/bundle/`

### Windows (.msi / .exe)

- **Lokacija**: `src-tauri/target/release/bundle/msi/`
- **Format**: MSI installer ili NSIS installer
- **Veličina**: ~15-30 MB (kompresovano)

**Code signing (Windows):**
```bash
# Nabavi Windows Code Signing Certificate
# Konfiguriši u tauri.conf.json:
"windows": {
  "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
  "digestAlgorithm": "sha256",
  "timestampUrl": "http://timestamp.digicert.com"
}
```

### macOS (.dmg)

- **Lokacija**: `src-tauri/target/release/bundle/dmg/`
- **Format**: DMG disk image
- **Veličina**: ~20-40 MB

**Code signing & notarization (macOS):**
```bash
# Nabavi Apple Developer ID Certificate
# Konfiguriši u tauri.conf.json:
"macOS": {
  "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
  "providerShortName": "TEAM_ID",
  "entitlements": "path/to/entitlements.plist"
}

# Nakon build-a, notarize sa Apple:
xcrun notarytool submit "app.dmg" --apple-id "your@email.com" --team-id "TEAM_ID" --wait
xcrun stapler staple "app.dmg"
```

### Linux (.AppImage / .deb)

- **Lokacija**: `src-tauri/target/release/bundle/appimage/` ili `deb/`
- **Format**: AppImage (portable) ili DEB package
- **Veličina**: ~20-35 MB

**Code signing (Linux):**
```bash
# Za DEB package:
dpkg-sig --sign builder magacin-app_1.0.0_amd64.deb

# Za AppImage:
# Opciono - GPG signing za verifikaciju
```

## Auto-update konfiguracija

### 1. Kreiranje update servera

Potreban je HTTPS endpoint koji servira JSON manifest:

```json
{
  "version": "1.0.1",
  "notes": "Bug fixes and improvements",
  "pub_date": "2025-10-15T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "BASE64_SIGNATURE",
      "url": "https://your-server.com/releases/magacin-app_1.0.1_x64.msi"
    },
    "darwin-x86_64": {
      "signature": "BASE64_SIGNATURE",
      "url": "https://your-server.com/releases/magacin-app_1.0.1_x64.dmg"
    },
    "linux-x86_64": {
      "signature": "BASE64_SIGNATURE",
      "url": "https://your-server.com/releases/magacin-app_1.0.1_amd64.AppImage"
    }
  }
}
```

### 2. Generisanje ključeva za potpis

```bash
# Install Tauri CLI globalno
cargo install tauri-cli

# Generiši key pair
tauri signer generate -w ~/.tauri/magacin-app.key

# Output:
# Private key: ~/.tauri/magacin-app.key
# Public key: (prikazano u terminalu)
```

### 3. Konfiguracija u tauri.conf.json

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-update-server.com/releases/{{target}}/{{arch}}/{{current_version}}"
      ],
      "pubkey": "YOUR_GENERATED_PUBLIC_KEY_HERE"
    }
  }
}
```

### 4. Potpisivanje release-a

```bash
# Nakon build-a, potpiši artefakte:
tauri signer sign ~/.tauri/magacin-app.key \
  src-tauri/target/release/bundle/msi/magacin-app_1.0.0_x64_en-US.msi

# Output: BASE64 signature → dodaj u manifest JSON
```

### 5. Upload na server

```bash
# Upload artefakata na update server
scp src-tauri/target/release/bundle/msi/*.msi user@server:/var/www/releases/
scp src-tauri/target/release/bundle/dmg/*.dmg user@server:/var/www/releases/
scp src-tauri/target/release/bundle/appimage/*.AppImage user@server:/var/www/releases/

# Upload manifest JSON
scp manifest.json user@server:/var/www/releases/
```

## Distribucija

### Metod 1: Direktna distribucija (Intranet)

- Kopiraj installer fajlove na file server
- Pošalji link krajnjim korisnicima
- Korisnici preuzimaju i instaliraju ručno

### Metod 2: Package manager (opciono)

**Windows:**
- Winget: Kreiraj winget manifest
- Chocolatey: Publish na Chocolatey repo

**macOS:**
- Homebrew: Kreiraj Homebrew cask

**Linux:**
- APT repo: Postavi private APT repository
- Flatpak: Package kao Flatpak app

### Metod 3: Cloud storage

- Upload na Google Drive / Dropbox / OneDrive
- Share link sa organizacijom
- Korisnici preuzimaju direktno

## Database migration strategy

Pri ažuriranjima koje menjaju šemu baze:

1. **Backup postojeće baze** (automatski u app kodu pre migracije)
2. **Run migration script** (u `migrations.js`)
3. **Rollback plan** (opcija za vraćanje na prethodnu verziju)

Primer migracije za v1.1:
```javascript
// migrations.js
export async function migrate_v1_1() {
  const db = await getDatabase();
  
  // Add new column
  await db.execute('ALTER TABLE items ADD COLUMN barcode TEXT');
  
  // Update schema version
  await db.execute('PRAGMA user_version = 2');
}
```

## Testing na produkciji

Pre produkcijskog release-a:

1. **Staged rollout**: Deploy na malu grupu korisnika (beta testeri)
2. **Monitor logs**: Prati logove za greške i performanse
3. **User feedback**: Prikupi feedback od beta testera
4. **Fix bugs**: Adress kritične bugove pre šireg release-a
5. **Full rollout**: Deploy na sve korisnike

## Troubleshooting deployment issues

### Problem: Code signing greška (Windows/macOS)

**Rešenje:**
- Proveri da li je sertifikat validan
- Proveri da li je timestampUrl ispravan
- Proveri da li ima konflikta sa drugim sertifikatima

### Problem: Auto-update ne radi

**Rešenje:**
- Proveri da li je update server dostupan (HTTPS)
- Proveri da li je public key tačan u tauri.conf.json
- Proveri da li je signature tačan u manifest JSON-u
- Proveri network connectivity (firewall, proxy)

### Problem: Instalacija ne prolazi (Windows)

**Rešenje:**
- Proveri da li je WebView2 instaliran
- Proveri antivirus/firewall settings
- Proveri da li korisnik ima admin prava

### Problem: Aplikacija se ne pokreće nakon instalacije

**Rešenje:**
- Proveri logove u `%APPDATA%/com.magacinapp.app/logs/`
- Proveri da li su sve dependencije uključene u bundle
- Proveri permissions na direktorijumima

## Rollback plan

Ako se desi kritičan bug nakon release-a:

1. **Brzo reaguj**: Ukloni link za download
2. **Rollback na prethodnu verziju**: Zameni manifest JSON sa prethodnom verzijom
3. **Notify korisnici**: Obavesti korisnike da ne instaliraju novu verziju
4. **Fix bug**: Ispravi bug u kodu
5. **Re-release**: Kreiraj novi patch release (1.0.2)

## Post-deployment

- [ ] Monitor update statistics (koliko korisnika je ažuriralo)
- [ ] Monitor crash reports (ako postoji integracija)
- [ ] Prikupi user feedback
- [ ] Plan sledeći release (features, bugfixes)

## Security considerations

- **HTTPS only**: Update server mora koristiti HTTPS
- **Signature verification**: Uvek verifikuj potpise pre instalacije
- **Code signing**: Potpisuj sve release artefakte
- **Secure credentials**: Ne commituj private keys u git
- **Access control**: Ograniči pristup update serveru

---

**Napomena**: Ovo je generalni vodič. Konkretne procedure mogu varirati u zavisnosti od organizacione infrastrukture.

**Za dodatnu pomoć**: Pogledaj Tauri dokumentaciju → https://tauri.app/v1/guides/distribution/

