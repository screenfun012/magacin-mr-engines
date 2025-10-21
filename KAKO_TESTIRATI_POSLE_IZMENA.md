# Kako Testirati Posle Izmena - Brzi Vodič

**Datum:** 12. Oktobar 2025

## 🔨 1. BUILD Aplikacije

### Opcija A: Production Build (DMG za instalaciju)

```bash
cd /Users/nikola/magacin-app
npm run tauri build
```

**Rezultat:** DMG fajl u `src-tauri/target/release/bundle/dmg/`

### Opcija B: Dev Mode (Brže za testiranje)

```bash
cd /Users/nikola/magacin-app
npm run tauri dev
```

**Rezultat:** Aplikacija se pokreće odmah, bez pravljenja DMG-a

---

## ⚡ PREPORUKA: Koristi DEV MODE za testiranje!

Dev mode je **10x brži** za testiranje izmena:

- ✅ Ne pravi DMG
- ✅ Pokreće se za ~30 sekundi
- ✅ Možeš odmah da testiraš
- ✅ Možeš da vidiš console logove uživo

**Komanda:**

```bash
npm run tauri dev
```

---

## 🧪 2. TESTIRANJE - Šta Proveriti

### Test 1: Performanse (najlakši test)

1. Otvori aplikaciju
2. Pritisni **F12** ili **Cmd+Option+I** (otvara Developer Tools)
3. Klikni na **Console** tab
4. Posmatraj:

   - Ne bi trebalo da vidiš **konstantne** logove
   - Logovi se pojavljuju samo kad radiš neku akciju
   - **BEFORE:** Logovi svakih 1-2 sekunde
   - **AFTER:** Logovi samo pri klikovima/akcijama

5. Klikni na **Network** tab u Dev Tools:
   - Ne bi trebalo da vidiš stalne SQL upite
   - **BEFORE:** 1-2 upita/sekundi
   - **AFTER:** Upiti samo kad klikneš nešto

### Test 2: Vraćanje Robe

1. **Zaduži robu:**

   - Idi na **Magacin** → tab **"Izdaj robu"**
   - Izaberi radnika (npr. "Marko Marković")
   - Izaberi artikal (npr. neki koji ima dovoljno količine)
   - Unesi količinu (npr. 5)
   - Klikni **"Izdaj robu"** ✅
   - Trebalo bi da vidiš toast notifikaciju uspešnog zaduženja

2. **Proveri da li je stanje smanjeno:**

   - Idi na **Magacin** → tab **"Stanje"**
   - Nađi artikal koji si izdao
   - Količina treba da bude **smanjena** za onoliko koliko si izdao

3. **Vrati robu:**

   - Idi na **Magacin** → tab **"Vrati robu"**
   - Izaberi **istog radnika**
   - Izaberi **isti artikal**
   - Unesi količinu (može i deo, npr. 3 od 5)
   - Klikni **"Vrati robu"** ✅
   - Trebalo bi da vidiš toast: "✅ Roba vraćena"

4. **Proveri stanje opet:**
   - Idi na **Magacin** → tab **"Stanje"**
   - Količina treba da bude **povećana** za onoliko koliko si vratio

**✅ Uspeh:** Ako količine odgovaraju → vraćanje radi!

### Test 3: Razdužavanje (Brisanje zaduženja sa Dashboard-a)

1. **Prvo zaduži nekog radnika** (ako nema nijednog zaduženja):

   - Idi na **Magacin** → **"Izdaj robu"**
   - Zaduži bilo šta

2. **Idi na Dashboard:**

   - Klikni na **Dashboard** u sidebar-u
   - Trebalo bi da vidiš tabelu sa zaduženjima

3. **Obriši zaduženje:**

   - Nađi red sa zaduženjima
   - Klikni na **trash ikonu** ❌ (crvena)
   - Otvoriće se dijalog za potvrdu
   - Klikni **"Potvrdi brisanje"**
   - Trebalo bi da vidiš toast: "✅ Razduženo - Zaduženje uklonjeno i roba vraćena u magacin"

4. **Proveri da li je nestalo:**

   - Red sa tim zaduženjем treba da **nestane** iz tabele

5. **Proveri stanje u magacinu:**
   - Idi na **Magacin** → **"Stanje"**
   - Nađi artikal koji je bio zadužen
   - Količina treba da bude **vraćena** (povećana)

**✅ Uspeh:** Ako se zaduženje obrisalo i količina vratila → razdužavanje radi!

### Test 4: Provera Console Logova

1. Otvori Dev Tools (F12)
2. Idi na Console tab
3. Uradi neku od gornjih akcija (vrati robu ili obriši zaduženje)
4. Trebalo bi da vidiš logove tipa:

```
returnIssue called: {itemId: 5, workerId: 2, qty: 3, actorUserId: 1}
Found issue: {...}
Returning stock: 3 to item: 5
Return completed successfully ✅
```

ili

```
deleteIssue called: {issueId: 15, actorUserId: 1}
Found issue to delete: {...}
Deactivating issue...
Returning stock to balance: {...}
✅ Issue deleted successfully - stock returned to warehouse
```

**✅ Uspeh:** Ako vidiš ove logove → sve funkcije rade!

---

## 🎯 Brzi Test Scenario (5 minuta)

1. Pokreni dev mode: `npm run tauri dev`
2. Otvori Dev Tools (F12) → Console
3. Zaduži nekog radnika (5 kom nečega)
4. Dashboard → obriši to zaduženje
5. Magacin → Stanje → proveri da li je količina vraćena

**Ako količina nije vraćena = bug još postoji**  
**Ako količina jeste vraćena = sve radi! ✅**

---

## 🐛 Ako Nešto Ne Radi

1. **Proveri console logove** - trebalo bi da vidiš tačno gde se zaustavilo
2. **Proveri bazu podataka** - može biti da je ostalo nešto od starih podataka
3. **Resetuj bazu:**

   ```bash
   rm ~/Library/Application\ Support/com.mrengines.magacin/magacin.db
   ```

   Zatim restartuj aplikaciju - kreiraće novu bazu sa test podacima

4. **Ako i dalje ne radi** - proveri da li si uradio rebuild (`npm run tauri build` ili `tauri dev`)

---

## ⏱️ Vreme Za Svaki Pristup

| Pristup               | Vreme Build-a | Kada Koristiti                     |
| --------------------- | ------------- | ---------------------------------- |
| `npm run tauri dev`   | ~30-60s       | Testiranje izmena, development     |
| `npm run tauri build` | ~5-10 min     | Finalni build, DMG za distribuцiju |

---

## 💡 Pro Tips

1. **Dev mode je tvoj prijatelj** - koristi ga za brzo testiranje
2. **Uvek gledaj console** - svi bagovi će biti tamo vidljivi
3. **Testiraj jednu stvar po jednu** - tako lakše uočiš šta radi, a šta ne
4. **Proveri Network tab** - vidi koliko često se šalju upiti (trebalo bi retko!)

---

## ✅ Checklist Pre Produkcije

- [ ] Dev mode test - sve funkcije rade
- [ ] Performanse - nema stalnih refresh-ova
- [ ] Console bez grešaka
- [ ] Production build uspešan
- [ ] DMG instalacija radi
- [ ] Testiranje na čistoj instalaciji

---

**Pitanja?** Ako nešto ne radi, proveri console logove - sve je detaljno logovano!
