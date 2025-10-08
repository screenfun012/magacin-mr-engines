# Magacin App - Setup script (Windows PowerShell)
# Automatska instalacija svih dependencija

Write-Host "🚀 Pokretanje setup procesa za Magacin App..." -ForegroundColor Green
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nije instaliran. Molimo instalirajte Node.js 18+ i pokrenite ponovo." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js verzija: $(node --version)" -ForegroundColor Green
}

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm nije instaliran. Molimo instalirajte npm i pokrenite ponovo." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ npm verzija: $(npm --version)" -ForegroundColor Green
}

# Check Rust
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust nije instaliran." -ForegroundColor Red
    Write-Host "Molimo instalirajte Rust sa: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "Nakon instalacije, restartujte PowerShell i pokrenite ponovo ovaj script." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ Rust verzija: $(rustc --version)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Instalacija npm dependencija..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm dependencije instalirane" -ForegroundColor Green
} else {
    Write-Host "❌ Greška pri instalaciji npm dependencija" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Build Rust dependencija (može potrajati nekoliko minuta)..." -ForegroundColor Cyan
Set-Location src-tauri
cargo build
Set-Location ..

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Rust dependencije build-ovane" -ForegroundColor Green
} else {
    Write-Host "❌ Greška pri build-ovanju Rust dependencija" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup završen uspešno!" -ForegroundColor Green
Write-Host ""
Write-Host "Za pokretanje aplikacije u development modu:" -ForegroundColor Cyan
Write-Host "  npm run tauri:dev" -ForegroundColor White
Write-Host ""
Write-Host "Za build produkcijske verzije:" -ForegroundColor Cyan
Write-Host "  npm run tauri:build" -ForegroundColor White
Write-Host ""
Write-Host "Demo pristup:" -ForegroundColor Cyan
Write-Host "  Admin: admin / admin123" -ForegroundColor White
Write-Host "  Radnik: radnik1 / user123" -ForegroundColor White
Write-Host ""
Write-Host "Srećno! 🎉" -ForegroundColor Green

