# UNIREHBER

Universite arama, yorum yazma ve admin onay sistemi olan Node.js + Express + MongoDB projesi.

## Kurulum

1. Paketleri yukle:

```bash
npm install
```

2. `.env.example` dosyasini `.env` olarak kopyalayip gerekirse duzenle:

```env
PORT=3100
MONGO_URI=mongodb://127.0.0.1:27017/universite_yorum
SESSION_SECRET=unirehber-local-secret
ADMIN_PASSWORD=admin123
```

3. Sunucuyu calistir:

```bash
npm start
```

4. Tarayicida ac:

```text
http://localhost:3100
```

Admin panel:

```text
http://localhost:3100/admin
```

Varsayilan admin sifresi:

```text
admin123
```

## Yayina alma

Bu proje lokal bilgisayari sunucu yapmak zorunda degil. Render, Railway, VPS veya Docker destekleyen bir hostinge koyabilirsin.

Canli ortamda veritabani icin lokal MongoDB degil, MongoDB Atlas gibi bulut MongoDB kullan:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
SESSION_SECRET=uzun-rastgele-bir-deger
ADMIN_PASSWORD=guclu-admin-sifresi
```

Detayli adimlar icin [DEPLOY.md](DEPLOY.md) dosyasina bak.

## Excel'den universite aktarma

Excel dosyandaki kolonlar `ad`, `sehir`, `tur`, `web` olursa direkt okunur.

```bash
npm run import:excel -- ./universiteler.xlsx
```

Mevcut MongoDB koleksiyonun `universite_yorum.universiteler` ile uyumludur. Kod `ad`, `universite_adi`, `üniversite_adi` ve `üniversite_adı` alanlarini okuyacak sekilde yazildi.

## Hazir universite verisini yukleme

`data/universiteler.json` dosyasindaki hazir veriyi aktif `MONGO_URI` veritabanina aktarmak icin:

```bash
npm run seed:universiteler
```
