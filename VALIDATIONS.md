# Validacije i pravila poslovanja

## Magacinska pravila

### 1. Izdavanje robe (createIssue)

**Validacije:**
- `itemId` mora postojati u bazi
- `workerId` mora postojati i biti aktivan
- `qty` mora biti > 0
- `qty_on_hand` za artikal mora biti ≥ `qty`

**Ponašanje:**
- Kreiranje `issue` zapisa u bazi
- Smanjenje `qty_on_hand` u `stock_balances` za `qty`
- Upis u `stock_ledger` sa `reason: ISSUE` i `delta_qty: -qty`
- Celokupna operacija u SQL transakciji (ROLLBACK na grešku)

**SQL transakcija:**
```sql
BEGIN TRANSACTION;
-- Check stock
SELECT qty_on_hand FROM stock_balances WHERE item_id = ?;
-- Insert issue
INSERT INTO issues ...;
-- Update stock
UPDATE stock_balances SET qty_on_hand = qty_on_hand - ? WHERE item_id = ?;
-- Log
INSERT INTO stock_ledger ...;
COMMIT;
```

---

### 2. Editovanje zaduženja (updateIssueQty)

**Scenario primer:**
1. Uvezen artikal X = 10 kom
2. Zaduži radniku Pera = 5 kom → magacin: 10 - 5 = 5
3. Izmeni zaduženje na 6 kom → magacin: 5 - (6-5) = 4

**Validacije:**
- `issueId` mora postojati i biti aktivan
- `newQty` mora biti > 0
- Ako se povećava zaduženje (delta > 0), mora biti dovoljno stanje: `qty_on_hand ≥ delta`

**Ponašanje:**
- Izračunaj `delta = newQty - oldQty`
- Ažuriraj `issues.qty = newQty`
- Ažuriraj `stock_balances.qty_on_hand = qty_on_hand - delta`
- Upis u `issue_history` (prev_qty, new_qty, actor, timestamp)
- Upis u `stock_ledger` sa `reason: EDIT_ISSUE` i `delta_qty: -delta`
- Celokupna operacija u SQL transakciji

**Vizuelna indikacija:**
- Količina u Dashboardu prelazi iz **zelene** (originalna) u **narandžastu** (izmenjena)
- Tooltip na hover prikazuje istoriju izmena (ko, kada, sa koje vrednosti, na koju)

---

### 3. Brisanje zaduženja (deleteIssue)

**Validacije:**
- `issueId` mora postojati i biti aktivan

**Ponašanje:**
- Postavi `issues.is_active = 0` (soft delete)
- Vrati količinu u magacin: `stock_balances.qty_on_hand = qty_on_hand + issue.qty`
- Upis u `stock_ledger` sa `reason: DELETE_ISSUE` i `delta_qty: +qty`
- Celokupna operacija u SQL transakciji

**UX:**
- Pre brisanja prikazuje se **Confirm dialog** sa upozorenjem
- Toast notifikacija **crvena** nakon uspešnog brisanja

---

### 4. Vraćanje robe (returnIssue)

**Validacije:**
- Radnik mora imati aktivno zaduženje za dati artikal
- `qty` za vraćanje mora biti ≤ `issue.qty` (trenutno zadužena količina)

**Ponašanje:**
- Ako se vraća celokupna količina: `issues.is_active = 0`
- Ako se vraća deo: `issues.qty = issue.qty - qty` i upis u `issue_history`
- Vrati količinu u magacin: `stock_balances.qty_on_hand = qty_on_hand + qty`
- Upis u `stock_ledger` sa `reason: RETURN` i `delta_qty: +qty`
- Celokupna operacija u SQL transakciji

**Use-case:**
- Radnik vraća opremu nakon završetka posla
- Radnik vraća neiskorišćenu količinu materijala

---

### 5. Dodavanje artikla (addItem)

**Validacije:**
- Kombinacija `name` + `sku` mora biti jedinstvena
- `min_qty` mora biti ≥ 0
- `initial_qty` može biti ≥ 0 (default: 0)

**Ponašanje:**
- Kreiranje zapisa u `items`
- Kreiranje zapisa u `stock_balances` sa `qty_on_hand = initial_qty`
- Ako `initial_qty > 0`: upis u `stock_ledger` sa `reason: ADD_STOCK`

**Alternativa - dopuna postojećeg:**
- Ako artikal već postoji, korisnik može odabrati "Dopuni postojeći"
- Ažurira se samo `stock_balances.qty_on_hand += qty`
- Upis u `stock_ledger` sa `reason: ADD_STOCK`

---

### 6. Minimalne količine

**Pravilo:**
- Svaki artikal ima `min_qty` (threshold)
- Kada `qty_on_hand ≤ min_qty`, artikal se prikazuje kao "Nisko stanje"

**Indikatori:**
- Badge **crvena** ("Nisko stanje") u tabeli stanja
- Alert baner u Magacin → Za poručivanje tabu
- Lista artikala za poručivanje sa sortiranjem po stanju

**Filter opcije (planirano):**
- "Samo ispod minimuma": `qty_on_hand ≤ min_qty`
- "Uskoro ispod minimuma": `qty_on_hand ≤ min_qty + 10%`

---

## Rad sa radnicima i odeljenjima

### 7. Dodavanje radnika

**Validacije:**
- `first_name`, `last_name` i `department_id` obavezni
- Kombinacija `(first_name, last_name, department_id)` mora biti jedinstvena
- `department_id` mora postojati i biti aktivan

**Ponašanje:**
- Kreiranje zapisa u `workers` sa `is_active = 1`

### 8. Editovanje/Deaktivacija radnika

**Validacije:**
- Radnik mora postojati
- Pri promeni odeljenja, novo odeljenje mora postojati

**Ponašanje:**
- Update `first_name`, `last_name`, `department_id` ili `is_active`
- Soft delete (deaktivacija): `is_active = 0` (radnik ostaje u bazi radi istorije)

**Napomena:**
- Neaktivni radnici se ne prikazuju u dropdown-ima za izdavanje robe
- Postojeća zaduženja neaktivnih radnika ostaju vidljiva u Dashboardu

---

### 9. Dodavanje/Editovanje odeljenja

**Validacije:**
- `name` mora biti jedinstveno
- `name` ne sme biti prazno

**Ponašanje:**
- CRUD operacije na `departments`
- Soft delete: `is_active = 0`

---

## Auth i bezbednost

### 10. Login

**Validacije:**
- `username` i `password` obavezni
- Username mora postojati u bazi
- Password mora odgovarati heširanom passwordu (bcrypt)
- Korisnik mora biti aktivan (`is_active = 1`)

**Ponašanje:**
- Na uspeh: vraća `user` objekat (bez password_hash)
- Na grešku: vraća poruku "Korisničko ime ili lozinka nisu tačni" (namerno nespecifično radi bezbednosti)
- Upis u `logs` pri uspešnoj prijavi

---

### 11. Role-based access

**Pravila:**
- **admin**: Pristup svim modulima (Dashboard, Magacin, Izvoz, Admin Panel)
- **user**: Pristup osnovnim modulima (Dashboard, Magacin, Izvoz) — bez Admin Panel-a

**Implementacija:**
- Sidebar komponenta filtrira stavke na osnovu `isAdmin()`
- Admin Panel se renderuje samo ako je korisnik admin

---

## Audit trail

### 12. Logovanje događaja

**Kategorije:**
- `system`: Seedovanje baze, sistemski događaji
- `inventory`: Dodavanje/izmena artikala
- `issue`: Izdavanje/vraćanje/editovanje zaduženja
- `auth`: Prijave/odjave
- `admin`: CRUD radnika/odeljenja

**Polja:**
- `category`, `action`, `entity`, `entity_id`
- `actor_user_id`: Ko je izvršio akciju
- `payload`: JSON sa dodatnim podacima
- `created_at`: UTC timestamp

**Use-case:**
- Pretraga po kategoriji, akciji, entitetu, korisniku, datumu
- Paginacija i filtering u Admin Panel → Logovi tabu

---

## Dodatne validacije

### 13. Numeričke validacije

- Količine (`qty`) moraju biti pozitivne decimale (≥ 0.01)
- Minimalne količine moraju biti ≥ 0

### 14. Foreign key validacije

- SQL baza ima FOREIGN KEY constrainte uključene
- Pri brisanju povezanih entiteta, koristi se soft delete (`is_active = 0`)

### 15. Unique constrainti

- `items`: `(name, sku)` jedinstvena kombinacija
- `workers`: `(first_name, last_name, department_id)` jedinstvena kombinacija
- `users`: `username` jedinstven

---

## Testing checklist

Pri implementaciji proverite:

- [ ] Scenario izdavanja → editovanja → brisanja (brojke se poklapaju u svim tabelama)
- [ ] Minimalne količine se detektuju i prikazuju
- [ ] Edit zaduženja menja boju i prikazuje tooltip sa istorijom
- [ ] Brisanje zaduženja vraća robu u magacin
- [ ] Confirm dialog se prikazuje pre kritičnih akcija
- [ ] Toast notifikacije su u skladu sa akcijama (zeleno/narandžasto/crveno)
- [ ] Transakcije se rollback-uju na greške
- [ ] Audit logovi bilježe sve akcije
- [ ] Admin ne može pristupiti user funkcijama koje su ograničene
- [ ] Light/Dark mode se čuva i primenjuje
- [ ] Nije moguće izdati više nego što je na stanju

---

**Verzija dokumenta:** 1.0.0
**Poslednje ažuriranje:** Oktobar 2025

