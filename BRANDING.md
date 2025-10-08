# Branding - MR Engines

## Logo fajlovi

Aplikacija koristi oficijelne logoe MR Engines kompanije koji se nalaze u `/public/logos/` direktorijumu:

### Glavni logoi

1. **mr-engines-light.png** - Logo sa belim slovima

   - Koristi se na: Login stranici (tamna pozadina)
   - Dimenzije: Full logo sa "Engines" tekstom i "MADE IN SERBIA" pečatom

2. **mr-engines-dark.png** - Logo sa crnim slovima

   - Koristi se na: Svetlim pozadinama
   - Dimenzije: Full logo sa "Engines" tekstom i "MADE IN SERBIA" pečatom

3. **mr-small.png** - Mali "MR" logo

   - Koristi se na: Sidebar-u, faviconu
   - Dimenzije: 192x192px
   - Samo crveni "MR" bez dodatnog teksta

4. **mr-engines-since-1968.png** - Retro logo sa mascotom

   - Special logo sa retro dizajnom i radnikom
   - "SINCE 1968" tekst

5. **banner.png** - Email banner
   - Slogan: "SNAGA MOTORA U NAŠIM RUKAMA"
   - Koristi se za: Email potpise, printove

## Implementacija u aplikaciji

### Login stranica (`/src/components/Login.jsx`)

```jsx
<img src="/logos/mr-engines-light.png" alt="MR Engines" className="w-full h-auto max-w-[280px] mx-auto" />
```

### Sidebar (`/src/components/Sidebar.jsx`)

```jsx
<img src="/logos/mr-small.png" alt="MR Engines" className="w-16 h-16 object-contain" />
```

### Favicon

- **Fajl**: `/public/favicon.png`
- **Source**: Mali MR logo (192x192px)
- **Konfiguracija**: `index.html`

### Desktop aplikacija

- **Ikona**: `/src-tauri/icons/icon.png`
- **Source**: Mali MR logo
- **Platforme**: Windows, macOS, Linux

## Brand boje

Aplikacija koristi MR Engines brand boje definisane u Tailwind konfiguraciji:

```javascript
colors: {
  'brand-red': '#DC2626',    // Crvena - primarna boja
  'brand-black': '#1A1A1A',  // Crna
  'brand-gray': '#6B7280',   // Siva
}
```

## Dodatne informacije

- **Kompanija**: MR Engines d.o.o.
- **Osnovan**: 1968
- **Slogan**: "SNAGA MOTORA U NAŠIM RUKAMA"
- **Delatnost**: Servisi motora - Made in Serbia

## Naziv aplikacije

- **Web naslov**: "Magacin - MR Engines"
- **Desktop naziv**: "Magacin - MR Engines"
- **Package ID**: `com.mrengines.magacin`
- **Verzija**: 1.0.0
