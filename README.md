# Midho Studio

Website promosi dan dashboard manajemen Midho Studio.

## Frontend v1
- Visual premium, modern, clean, dan presisi
- Primary color `#0E43AB`
- Responsive desktop dan mobile
- Homepage public
- Portfolio filtering
- Pricing section
- CTA WhatsApp dan lynk.id siap dihubungkan
- Admin dashboard preview
- Statistik, grafik, order list, progress, dan status UI

## Struktur
- `index.html` — website publik
- `admin/index.html` — dashboard admin
- `assets/styles.css` — design system
- `assets/app.js` — interaksi dan konfigurasi CTA
- `vercel.json` — konfigurasi deploy

## Konfigurasi CTA
Edit `assets/app.js`:
```js
const CONFIG = {
  whatsapp: "628xxxxxxxxxx",
  lynk: "https://lynk.id/..."
};
```

## Supabase
Target project: `cmtcbtfvugxmknftjflz`.

Integrasi auth/database belum ditanam karena konektor Supabase yang tersedia saat ini belum memiliki izin ke project tersebut. Tidak ada secret/key yang disimpan di repository.

Rencana data:
- orders
- order_progress
- services
- portfolio
- pricing
- site_content
- admin_profiles

Setelah akses tersedia: admin auth, RLS, Storage, CRUD order, progress checklist, portfolio, pricing, site content, date filter, dan statistik real akan diaktifkan.
