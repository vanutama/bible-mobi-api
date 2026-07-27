# Bible Mobi API

REST API untuk mengambil ayat-ayat Alkitab dari [alkitab.mobi](https://alkitab.mobi/) (Alkitab Mobile SABDA).  
Deployed sebagai Vercel Serverless Functions.

## Endpoints

### Ambil Seluruh Pasal

```
GET /{version}/{book}/{chapter}
```

**Contoh:** `GET /tb/Kej/1` → Kejadian pasal 1 (Terjemahan Baru)

### Ambil 1 Ayat

```
GET /{version}/{book}/{chapter}?verse={number}
```

**Contoh:** `GET /tb/Yoh/3?verse=16` → Yohanes 3:16

### Ambil Rentang Ayat

```
GET /{version}/{book}/{chapter}?start={from}&end={to}
```

**Contoh:** `GET /tb/Yoh/1?start=1&end=4` → Yohanes 1:1-4

## Response Format

```json
{
  "book": "Yoh",
  "chapter": 3,
  "version": "tb",
  "verses": [
    {
      "verse": 16,
      "content": "Karena begitu besar kasih Allah akan dunia ini...",
      "type": "content",
      "order": 5
    }
  ]
}
```

### Verse Types

| Type | Deskripsi |
|---|---|
| `content` | Isi ayat |
| `title` | Judul paragraf / perikop |

## Versi Alkitab yang Tersedia

### Internasional

| Code | Nama |
|---|---|
| `av` | Authorized Version (KJV) |
| `net` | New English Translation |
| `nkjv` | New King James Version |
| `amp` | Amplified Bible |
| `esv` | English Standard Version |
| `niv` | New International Version |
| `bbe` | Bible in Basic English |

### Indonesia

| Code | Nama |
|---|---|
| `tb` | Terjemahan Baru |

### Bahasa Daerah

`jawa`, `sunda`, `toba`, `makasar`, `bali`, `lampung`, `simalungun`, `nias`, `aceh`, `mentawai`, `mamasa`, `berik`, `manggarai`, `sabu`, `kupang`, `abun`, `meyah`, `uma`, `yawa`, `gorontalo`, `barantak`, `bambam`, `mongondow`, `aralle`, `napu`, `sangir`, `taa`, `rote`, `galela`, `yali`, `tabaru`, `karo`

## Contoh Penggunaan (Astro / JavaScript)

```javascript
// Fetch Yohanes 3:16 (TB)
const res = await fetch('https://your-project.vercel.app/tb/Yoh/3?verse=16');
const data = await res.json();
console.log(data.verses[0].content);
```

## Development

```bash
# Install dependencies
npm install

# Run locally (requires Vercel CLI)
npx vercel dev

# Deploy
npx vercel --prod
```

## Credits

Data dari [Alkitab Mobile SABDA](https://alkitab.mobi/) — © Yayasan Lembaga SABDA.
