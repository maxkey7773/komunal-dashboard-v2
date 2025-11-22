# Kommunal Dashboard (Replit + Neon Postgres)

## 1. Setup
1) Neon Postgres yaratib, `DATABASE_URL` olasiz.  
2) Replit Secrets (.env) ga quyidagilarni qo'shing:

```
DATABASE_URL=...
SESSION_SECRET=long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

3) Install & migrate:
```bash
npm i
npx prisma migrate dev
# (v2 o'zgarish: Purchase tablaga receiptUrl qo'shildi)
node prisma/seed.js
npm run dev
```

## 2. Login
- `/login` orqali kiriladi.
- Admin: env dagi login/parol.
- User yaratish hozircha seed orqali emas (keyin qo'shish mumkin).

## 3. Funksiyalar (MVP)
- Admin:
  - Obyektlar CRUD
  - Harajat turlari CRUD
  - Harajatlar CRUD + qarz va muddat
  - Qarz so'ndirish (meter quantity + tarif) → debtAmount kamayadi
  - Obyekt profilida kommunal ID va inspektorlar saqlash
  - Purchases (sotib olingan narsalar) CRUD
- User:
  - Dashboard read-only
  - Obyekt profilini ko'rish

## 4. Deploy
Replit Deployments → Autoscale/Reserved VM.

> Keyingi bosqichlarda: foydalanuvchi yaratish, Excel eksport, fayl biriktirish, ko'p til RU/UZ toggle qo'shiladi.
