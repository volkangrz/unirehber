# UNIREHBER Yayina Alma

Bu proje yayina alindiginda senin bilgisayarin sunucu olmaz. Node.js uygulamasi hosting servisinde calisir, MongoDB ise bulutta calisir.

## Gerekenler

- GitHub hesabina yuklenmis proje kodu
- MongoDB Atlas veya baska bir bulut MongoDB baglanti adresi
- Node.js destekleyen hosting: Render, Railway, VPS veya Docker destekleyen herhangi bir servis

## MongoDB Atlas

1. Atlas'ta bir cluster olustur.
2. Database adini `universite_yorum` yap.
3. Network Access bolumunde hosting servisinin erisebilecegi IP iznini ver.
4. Connection string al:

```text
mongodb+srv://KULLANICI:SIFRE@cluster-adresi/universite_yorum?retryWrites=true&w=majority
```

5. Bu paketin icindeki hazir universite verisini Atlas'a aktarmak icin `.env` icindeki `MONGO_URI` degerini Atlas adresinle degistirip sunu calistir:

```bash
npm run seed:universiteler
```

Alternatif olarak Compass'tan export/import da yapabilirsin.

## Render ile yayinlama

1. Projeyi GitHub'a yukle.
2. Render'da New Web Service sec.
3. GitHub reposunu sec.
4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Environment variables ekle:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
SESSION_SECRET=uzun-rastgele-bir-deger
ADMIN_PASSWORD=guclu-admin-sifresi
```

7. Deploy tamamlaninca verilen `https://...` adresi artik sitenin gercek internet adresidir.

## Railway ile yayinlama

1. Projeyi GitHub'a yukle.
2. Railway'de New Project > Deploy from GitHub repo sec.
3. Variables bolumune sunlari ekle:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
SESSION_SECRET=uzun-rastgele-bir-deger
ADMIN_PASSWORD=guclu-admin-sifresi
```

4. Railway otomatik olarak `npm start` ile calistirir.

## Onemli

- `.env` dosyasini GitHub'a yukleme. `.gitignore` bunu engeller.
- Production'da lokal `mongodb://127.0.0.1:27017/...` kullanma.
- Admin sifresini `admin123` birakma.
- Site yayinda olduktan sonra admin panel adresi:

```text
https://senin-domainin/admin
```
