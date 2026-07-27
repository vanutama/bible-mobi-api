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

## Contoh Panggil API

> Ganti `https://bible-mobi-api.vercel.app` dengan domain Vercel kamu.

### 1. Ambil 1 Ayat — Yohanes 3:16

**URL:** buka langsung di browser:
```
https://bible-mobi-api.vercel.app/tb/Yoh/3?verse=16
```

**curl:**
```bash
curl "https://bible-mobi-api.vercel.app/tb/Yoh/3?verse=16"
```

**Response:**
```json
{
  "book": "Yoh",
  "chapter": 3,
  "version": "tb",
  "source": "static",
  "verses": [
    {
      "verse": 16,
      "content": "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.",
      "type": "content",
      "order": 16
    }
  ]
}
```

### 2. Ambil Rentang Ayat — Yohanes 1:1-4

**URL:**
```
https://bible-mobi-api.vercel.app/tb/Yoh/1?start=1&end=4
```

**curl:**
```bash
curl "https://bible-mobi-api.vercel.app/tb/Yoh/1?start=1&end=4"
```

**Response:**
```json
{
  "book": "Yoh",
  "chapter": 1,
  "version": "tb",
  "source": "scrape",
  "verses": [
    {
      "verse": 1,
      "content": "Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah.",
      "type": "content",
      "order": 1
    },
    {
      "verse": 2,
      "content": "Ia pada mulanya bersama-sama dengan Allah.",
      "type": "content",
      "order": 2
    },
    {
      "verse": 3,
      "content": "Segala sesuatu dijadikan oleh Dia dan tanpa Dia tidak ada suatupun yang telah jadi dari segala yang telah dijadikan.",
      "type": "content",
      "order": 3
    },
    {
      "verse": 4,
      "content": "Dalam Dia ada hidup dan hidup itu adalah terang manusia.",
      "type": "content",
      "order": 4
    }
  ]
}
```

### 3. Ambil Seluruh Pasal — Kejadian 1

**URL:**
```
https://bible-mobi-api.vercel.app/tb/Kej/1
```

**curl:**
```bash
curl "https://bible-mobi-api.vercel.app/tb/Kej/1"
```

**Response (dipotong):**
```json
{
  "book": "Kej",
  "chapter": 1,
  "version": "tb",
  "source": "scrape",
  "verses": [
    {
      "verse": 0,
      "content": "Allah menciptakan langit dan bumi serta segala isinya",
      "type": "title",
      "order": 0
    },
    {
      "verse": 1,
      "content": "Pada mulanya Allah menciptakan langit dan bumi.",
      "type": "content",
      "order": 1
    }
  ]
}
```

### 4. Versi Lain — John 3:16 (NIV)

**URL:**
```
https://bible-mobi-api.vercel.app/niv/Yoh/3?verse=16
```

## URL Pattern

```
/{version}/{book}/{chapter}                → seluruh pasal
/{version}/{book}/{chapter}?verse=N        → 1 ayat
/{version}/{book}/{chapter}?start=N&end=M  → rentang ayat
/{version}/{book}/{chapter}?start=N        → dari ayat N sampai akhir pasal
```

## Response Fields

| Field | Tipe | Keterangan |
|---|---|---|
| `book` | string | Singkatan kitab (Yoh, Kej, Mzm, dll) |
| `chapter` | number | Nomor pasal |
| `version` | string | Kode versi (tb, niv, dll) |
| `source` | string | `"static"` = dari file JSON, `"scrape"` = live dari alkitab.mobi |
| `verses` | array | Daftar ayat |
| `verses[].verse` | number | Nomor ayat (0 = judul perikop) |
| `verses[].content` | string | Isi ayat / judul |
| `verses[].type` | string | `"content"` = ayat, `"title"` = judul perikop |
| `verses[].order` | number | Urutan tampil di halaman |

## Contoh di JavaScript / Astro

```javascript
// Ambil Yoh 3:16
const res = await fetch('https://bible-mobi-api.vercel.app/tb/Yoh/3?verse=16');
const data = await res.json();
const ayat = data.verses[0].content;
// → "Karena begitu besar kasih Allah akan dunia ini..."
```

```javascript
// Ambil rentang Yoh 3:16-18
const res = await fetch('https://bible-mobi-api.vercel.app/tb/Yoh/3?start=16&end=18');
const data = await res.json();

data.verses
  .filter(v => v.type === 'content')
  .forEach(v => {
    console.log(`${v.verse}. ${v.content}`);
  });
```

## Versi Alkitab yang Tersedia

Diambil dari [alkitab.mobi/tb/versions/](https://alkitab.mobi/tb/versions/):

### Bahasa Indonesia & Melayu

| Code | Nama |
|---|---|
| `tb` | Terjemahan Baru (1974) |
| `ayt` | Alkitab Yang Terbuka |
| `tl` | Terjemahan Lama (1954) |
| `milt` | Modified Indonesian Literal Translation (2008) |
| `sb2010` | Alkitab Shellabear Kontekstual (2010) |
| `sb2000` | Alkitab PB Shellabear Kontekstual (2000) |
| `sbdr` | Alkitab Shellabear (1912) |
| `tsi` | Terjemahan Sederhana Indonesia Edisi 3 (2014) |
| `bis` | Kabar Baik Bahasa Indonesia Sehari-hari (1985) |
| `vmd` | Versi Mudah Dibaca (2005) |
| `amd` | Alkitab Mudah Dibaca (2014) |
| `fayh` | Firman Allah Yang Hidup (1989) |
| `ende` | Alkitab Ende (1970) |
| `kszi` | Kitab Suci Zabur dan Injil Bahasa Malaysia (2008) |
| `kskk` | Kitab Suci Komunitas Kristiani (2002) |
| `wbtcdr` | Alkitab PB WBTC Draft (2006) |
| `okkh` | Open Kitab Kehidupan |
| `tmv` | Today's Malay Version (1987) |
| `bsd` | Bahasa Indonesia yang Disederhanakan (1988) |
| `kl1879` | PB Klinkert (1879) |
| `kl1863` | PB Klinkert (1863) |
| `baba` | PB Melayu Baba (1913) |
| `ambdr` | PB Ambon Draft (1877) |
| `keasberry` | Kitab Alkudus Keasberry (1853) |
| `keasberry1866` | Kitab Alkudus Keasberry (1866) |
| `ldkdr` | PB Leydekker Draft (1733) |
| `avb` | Alkitab Versi Borneo |
| `iban` | Bahasa Iban (2011) |

### Bahasa Suku (Nusantara)

`jawa`, `jawa2006`, `jawa2`, `jawasur`, `sunda`, `sunda2`, `madura`, `bauzi`, `bali`, `ngaju`, `sasak`, `bugis`, `makasar`, `toraja`, `duri`, `gorontalo`, `gorontalo_2006`, `balantak`, `barantak`, `bambam`, `kaili_daa`, `mongondow`, `aralle`, `napu`, `sangir`, `taa`, `rote`, `galela`, `yali`, `tabaru`, `karo`, `simalungun`, `toba`, `dairi`, `minang`, `nias`, `mentawai`, `lampung`, `aceh`, `mamasa`, `berik`, `manggarai`, `sabu`, `kupang`, `abun`, `meyah`, `uma`, `yawa`

### Bahasa Inggris

| Code | Nama |
|---|---|
| `niv` | New International Version |
| `esv` | English Standard Version |
| `nkjv` | New King James Version |
| `av` | Authorized Version (KJV) |
| `net` | New English Translation |
| `nasb` | New American Standard Bible |
| `amp` | Amplified Bible |
| `nlt` | New Living Translation |
| `gnb` | Good News Bible |
| `hcsb` | Holman Christian Standard Bible |
| `leb` | Lexham English Bible |
| `nrsv` | New Revised Standard Version |
| `reb` | Revised English Version |
| `erv` | Easy-to-Read Version |
| `evd` | English Version for the Deaf |
| `bbe` | Bible in Basic English |
| `msg` | The Message |
| `phillips` | Phillips NT in Modern English |
| `deib` | Deibler NT |
| `gullah` | Gullah NT Version |
| `cev` | Contemporary English Version |
| `cevuk` | Contemporary English Version UK |
| `gwv` | God's Word to the Nation |

### Bahasa Mandarin

| Code | Nama |
|---|---|
| `cuv` | Chinese Union Version (Traditional) |
| `cuvs` | Chinese Union Version (Simplified) |

### Teks Asli & Interlinear

| Code | Nama |
|---|---|
| `hebrew` | Hebrew Bible |
| `greek` | Greek WH Bible |
| `greek_str` | Greek WH Strong Bible |
| `greeksr` | Greek SR Bible |
| `greeksr_str` | Greek SR Strong Bible |
| `aytst` | AYT Interlinear |
| `tbst` | TB Interlinear |
| `tlst` | TL Interlinear |
| `avbst` | AVB Interlinear |
| `kjv` | KJV Interlinear |
| `nasbst` | NASB Interlinear |
| `netst` | NET Interlinear |

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
