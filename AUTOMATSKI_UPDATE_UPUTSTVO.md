# 🚀 Automatski Update Sistem - Kompletno Uputstvo

## ✅ Sve je spremno!

Aplikacija je **potpuno konfigurirana** sa automatskim update sistemom!

---

## 📦 Nova verzija 1.2.2 - Lokacija instalera:

```
C:\Users\MREngines\magacin-v1.2.0\src-tauri\target\release\bundle\msi\Magacin - MR Engines_1.2.2_x64_en-US.msi
```

**Instaliraj ovu verziju i aplikacija će RADITI sa update funkcionalnostima!** ✅

---

## 🎯 Kako koristiti automatski update sistem:

### **Metoda 1: Automatski release sa GitHub Actions** (PREPORUČENO)

Samo ova **3 koraka**:

```bash
# 1. Promeni verziju (npr. na 1.2.3)
npm run version-bump 1.2.3

# 2. Build lokalno (da testiraš pre push-a)
npm run tauri:build

# 3. Push sa tagom
git add .
git commit -m "chore: bump version to 1.2.3"
git tag v1.2.3
git push origin main --tags
```

**GitHub Actions će automatski:**
- ✅ Build-ovati aplikaciju
- ✅ Kreirati `latest.json`
- ✅ Kreirati GitHub Release
- ✅ Upload-ovati `.msi` i `latest.json`

**GOTOVO!** 🎉 Stare aplikacije će automatski videti update!

---

### **Metoda 2: Brzi release (sve odjednom)**

Još **BRŽE** - samo jedna komanda:

```bash
npm run quick-release 1.2.3
```

Ova komanda **automatski**:
1. Menja verziju u svim fajlovima
2. Commit-uje izmene
3. Build-uje aplikaciju
4. Kreira tag
5. Push-uje na GitHub

**I gotovo!** GitHub Actions radi ostatak! 🚀

---

## 🧪 Testiranje Update Funkcionalnosti:

### **Korak 1: Instaliraj trenutnu verziju (1.2.2)**

```
C:\Users\MREngines\magacin-v1.2.0\src-tauri\target\release\bundle\msi\Magacin - MR Engines_1.2.2_x64_en-US.msi
```

Pokreni aplikaciju i proveri da radi!

### **Korak 2: Kreiraj test verziju (1.2.3)**

```bash
npm run quick-release 1.2.3
```

Sačekaj da GitHub Actions završi (2-5 minuta).

### **Korak 3: Testiraj update u aplikaciji**

1. Otvori aplikaciju (verzija 1.2.2)
2. Admin Panel → **Ažuriranja**
3. Klikni **"Proveri za update"**
4. Trebalo bi da vidiš: **"Nova verzija 1.2.3 dostupna!"** ✨
5. Klikni **"Instaliraj update"**
6. Progress bar: 0% → 100%
7. Klikni **"Restartuj aplikaciju"**
8. Aplikacija se restartuje → **Verzija je sada 1.2.3!** 🎉

---

## 📋 Kratki reference (cheat sheet):

| Šta želiš | Komanda |
|-----------|---------|
| Promeni verziju | `npm run version-bump 1.2.3` |
| Build aplikaciju | `npm run tauri:build` |
| Brzi release (sve odjednom) | `npm run quick-release 1.2.3` |
| Proveri GitHub Actions | https://github.com/screenfun012/magacin-mr-engines/actions |
| Proveri releases | https://github.com/screenfun012/magacin-mr-engines/releases |

---

## 🔧 Šta je sve konfigurisano:

### ✅ **1. Tauri Updater Plugin**
- Active u `tauri.conf.json`
- Sve potrebne permisije dodate
- HTTP pristup GitHub-u omogućen
- Passive install mode za Windows

### ✅ **2. GitHub Actions Workflow**
- Fajl: `.github/workflows/release.yml`
- Automatski build na svakom `v*` tagu
- Automatski kreira `latest.json`
- Automatski upload-uje na GitHub Releases

### ✅ **3. Helper Skripte**
- `scripts/bump-version.js` - Menja verziju u svim fajlovima
- `scripts/quick-release.js` - Kompletni automated release workflow

### ✅ **4. Update Service**
- `src/lib/services/updateService.js` - Kompletna update logika
- `src/features/admin/UpdateTab.jsx` - UI za proveru i instalaciju

---

## 🎯 Workflow kada promeniš kod:

```
1. Napraviš izmene u kodu
   ↓
2. npm run quick-release 1.2.4
   ↓
3. Sačekaš 2-5 min (GitHub Actions build)
   ↓
4. Stare aplikacije automatski vide update! ✅
```

---

## ⚠️ Važno:

- **Verzija MORA biti veća** od trenutne (npr. 1.2.2 → 1.2.3)
- **GitHub Actions mora biti enabled** na repo-u (trebalo bi da jeste)
- **Tag MORA početi sa `v`** (npr. `v1.2.3`)
- **Latest.json MORA biti u GitHub Release** (Actions automatski kreira)

---

## 🆘 Troubleshooting:

### **Aplikacija se ne otvara?**
- Deinstaliraj staru verziju
- Instaliraj novu sa: `src-tauri\target\release\bundle\msi\*.msi`

### **Update funkcija pokazuje grešku?**
- Proveri da postoji **GitHub Release** sa **verzijom većom** od trenutne
- Proveri da **latest.json** postoji u release-u
- Otvori DevTools (Ctrl+Shift+I) i vidi error u konzoli

### **GitHub Actions failed?**
- Idi na: https://github.com/screenfun012/magacin-mr-engines/actions
- Klikni na failed workflow i vidi error
- Najčešći problemi: Node verzija, Rust instalacija

---

## 🎉 Zaključak:

**SVE JE AUTOMATIZOVANO!** Samo promeniš kod, pokreneš jednu komandu, i sve ostalo se dešava samo od sebe! 🚀

Enjoy! 💪

