#!/bin/bash

# Magacin App - Setup script
# Automatska instalacija svih dependencija

echo "🚀 Pokretanje setup procesa za Magacin App..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nije instaliran. Molimo instalirajte Node.js 18+ i pokrenite ponovo."
    exit 1
else
    echo "✅ Node.js verzija: $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm nije instaliran. Molimo instalirajte npm i pokrenite ponovo."
    exit 1
else
    echo "✅ npm verzija: $(npm --version)"
fi

# Check Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust nije instaliran."
    echo "Instalacija Rust-a..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo "✅ Rust instaliran"
else
    echo "✅ Rust verzija: $(rustc --version)"
fi

echo ""
echo "📦 Instalacija npm dependencija..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ npm dependencije instalirane"
else
    echo "❌ Greška pri instalaciji npm dependencija"
    exit 1
fi

echo ""
echo "🔧 Build Rust dependencija (može potrajati nekoliko minuta)..."
cd src-tauri
cargo build
cd ..

if [ $? -eq 0 ]; then
    echo "✅ Rust dependencije build-ovane"
else
    echo "❌ Greška pri build-ovanju Rust dependencija"
    exit 1
fi

echo ""
echo "✅ Setup završen uspešno!"
echo ""
echo "Za pokretanje aplikacije u development modu:"
echo "  npm run tauri:dev"
echo ""
echo "Za build produkcijske verzije:"
echo "  npm run tauri:build"
echo ""
echo "Demo pristup:"
echo "  Admin: admin / admin123"
echo "  Radnik: radnik1 / user123"
echo ""
echo "Srećno! 🎉"

