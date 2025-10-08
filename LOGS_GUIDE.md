# Vodic za logove sistema

## Kategorije logova

Svaki log ima kategoriju koja oznacava oblast sistema:

### 🔹 **system** (Siva boja - bg-gray-500)
- Sistemski dogadjaji
- Seed baze podataka
- Inicijalizacija aplikacije

### 🔹 **inventory** (Plava boja - bg-blue-500)
- `create_item` ➕ - Kreiranje novog artikla
- `add_stock` 📦 - Dodavanje stanja postojecem artiklu

### 🔹 **issue** (Amber boja - bg-amber-500)
- `create_issue` 📤 - Izdavanje robe radniku
- `edit_issue` ✏️ - Izmena kolicine zaduzenja
- `delete_issue` 🗑️ - Brisanje zaduzenja
- `return_item` ↩️ - Vracanje robe u magacin

### 🔹 **admin** (Ljubicasta boja - bg-purple-500)
- `create_worker` ➕ - Dodavanje radnika
- `create_department` ➕ - Dodavanje odeljenja
- `update_worker` ✏️ - Izmena radnika
- `update_department` ✏️ - Izmena odeljenja

### 🔹 **auth** (Zelena boja - bg-green-500)
- `login` - Uspesna prijava korisnika

### 🔹 **error** (Crvena boja - bg-red-500)
- Greske i exceptioni

## Vizuelne oznake

Svaki log ima:
- **Obojenu tackicu** (w-2 h-2) levo od kategorije
- **Badge** sa kategorijom
- **Emoji ikonu** za akciju
- **Monospace font** za vreme i payload

## Primer prikaza

```
Vreme               Kategorija    Akcija           Entitet    Korisnik  Detalji
2025-10-06 20:43   🟣 admin      ➕ create_worker   worker     admin     {"first_name":"Petar",...}
2025-10-06 20:42   🟡 issue      ✏️ edit_issue      issue      admin     {"old_qty":5,"new_qty":7}
2025-10-06 20:40   🔵 inventory  📦 add_stock       item       admin     {"qty":50}
```

## Search funkcionalnost

Pretraga pretrazuje:
- Kategoriju
- Akciju
- Entitet
- Korisnicko ime

## Refresh

Klik na "Osvezi" dugme ponovo ucitava sve logove iz baze.

