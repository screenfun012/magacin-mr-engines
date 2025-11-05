# Quick Start - Windows Testiranje

## 🚀 Na Windows mašini, pokreni ove komande:

```bash
# 1. Idi u projekat folder
cd C:\path\to\magacin-app

# 2. Pull najnoviji kod
git pull origin main

# 3. Instaliraj dependencies
npm install

# 4. Pokreni dev mode (PRVO testiraj dev)
npm run tauri:dev
```

---

## ✅ Brzi Test (5 min)

1. **Startuje li aplikacija?** ✅ / ❌
2. **Otvara se "Izvoz i uvoz" tab?** ✅ / ❌
3. **Možeš izabrati .xls fajl?** ✅ / ❌
4. **Preview se otvara?** ✅ / ❌
5. **Import prolazi?** ✅ / ❌
6. **Nova polja (Proizvođač, cene) vidljiva u tabeli?** ✅ / ❌

---

## 📦 Ako SVE radi, build-uj:

```bash
npm run tauri:build
```

**Build lokacija:** `src-tauri\target\release\bundle\msi\`

---

## 🐛 Ako NEŠTO ne radi:

1. Screenshot greške
2. Tekst greške iz konzole (F12)
3. Koji korak ne prolazi (1-6 gore)

Javi mi rezultate! 🙌

---

## 📋 Detaljna checklista:
Pogledaj `WINDOWS_TEST_CHECKLIST.md` za potpunu listu testova.

