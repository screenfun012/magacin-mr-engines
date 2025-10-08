# Instalacijske instrukcije za Magacin App

## Preduslovi

Pre nego što počnete, instalirajte sledeće:

### 1. Node.js i npm

**macOS (korišćenjem Homebrew):**
```bash
brew install node
```

**Windows:**
Preuzmite installer sa https://nodejs.org/

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Provera instalacije:
```bash
node --version
npm --version
```

### 2. Rust i Cargo

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Windows:**
1. Preuzmite `rustup-init.exe` sa https://rustup.rs/
2. Pokrenite installer i pratite instrukcije
3. Instalirajte Microsoft C++ Build Tools

Provera instalacije:
```bash
rustc --version
cargo --version
```

### 3. Sistemske zavisnosti

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

**Windows:**
- Instalirajte Microsoft C++ Build Tools
- Instalirajte WebView2 runtime (obično već instaliran na Windows 10/11)

## Instalacija projekta

### Korak 1: Kloniranje/preuzimanje projekta

```bash
cd /path/to/projects
# Ako je projekat u ZIP arhivi, raspakirajte ga
# Ako koristite git:
# git clone <repository-url>
cd magacin-app
```

### Korak 2: Instalacija npm dependencija

```bash
npm install
```

Ova komanda će instalirati sve potrebne JavaScript/React biblioteke.

### Korak 3: Build Rust dependencija (prvi put)

```bash
cd src-tauri
cargo build
cd ..
```

Ovo može potrajati nekoliko minuta jer Rust kompajlira sve dependencije.

## Pokretanje aplikacije

### Development mode

```bash
npm run tauri:dev
```

Ova komanda:
1. Pokreće Vite dev server
2. Kompajlira Tauri backend
3. Otvara desktop aplikaciju sa hot-reload

**Prvo pokretanje može potrajati 5-10 minuta jer Rust kompajlira sve dependencije!**

### Production build

```bash
npm run tauri:build
```

Binarne datoteke će biti kreirane u:
- Windows: `src-tauri/target/release/bundle/msi/` ili `nsis/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/` ili `deb/`

## Konfiguracija Ikonice (opciono)

Ikonice se nalaze u `src-tauri/icons/`. Zamenite placeholder fajlove sa pravim ikonicama:

- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `32x32.png`
- `128x128.png`
- `128x128@2x.png` (256x256)

Možete koristiti alate kao što su:
- https://www.icoconverter.com/
- https://iconverticons.com/

## Česte greške i rešenja

### Greška: "command not found: cargo"

**Rešenje:**
```bash
source $HOME/.cargo/env
# ili restartujte terminal
```

### Greška: "webkit2gtk not found"

**Rešenje (Linux):**
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

### Greška: "linker 'cc' not found"

**Rešenje (Linux):**
```bash
sudo apt install build-essential
```

### Greška: "failed to run custom build command for openssl-sys"

**Rešenje:**
```bash
# macOS
brew install openssl

# Linux
sudo apt install libssl-dev pkg-config
```

### Aplikacija se ne pokreće (Windows)

**Rešenje:**
- Proverite da li je WebView2 instaliran
- Preuzmite sa: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Baza podataka

SQLite baza se automatski kreira pri prvom pokretanju na lokaciji:

- **Windows**: `%APPDATA%/com.magacinapp.app/`
- **macOS**: `~/Library/Application Support/com.magacinapp.app/`
- **Linux**: `~/.local/share/com.magacinapp.app/`

## Seed podatke

Pri prvom pokretanju, baza se automatski popunjava sa demo podacima:

**Korisnici:**
- Admin: `admin` / `admin123`
- Radnik: `radnik1` / `user123`

**Odeljenja:**
- Proizvodnja
- Održavanje
- Administracija

**Radnici:**
- 6 radnika raspoređenih po odeljenjima

**Artikli:**
- 8 različitih artikala sa početnim stanjem

## Pomoć i podrška

Za dodatna pitanja ili probleme:

1. Proverite log fajlove u terminalu/command promptu
2. Proverite Tauri dokumentaciju: https://tauri.app/
3. Proverite React dokumentaciju: https://react.dev/

## Sledeći koraci

Nakon uspešne instalacije i pokretanja:

1. Prijavite se sa admin nalogom
2. Istražite Dashboard i pregledajte postojeća zaduženja
3. Pokušajte dodati novi artikal u Magacin
4. Kreirajte novo zaduženje
5. Proverite Admin Panel sa statistikama

Srećno korišćenje! 🚀

