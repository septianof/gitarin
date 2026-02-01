# 📖 Cara Menggunakan Backend Landing Page

## Quick Start

Backend sudah siap! Berikut cara menggunakannya di frontend:

### 1. Import Server Actions

```typescript
import { 
  getPopularCategories, 
  getFeaturedProducts 
} from "@/app/actions/landing-page";
```

### 2. Gunakan di Server Component

```typescript
// app/page.tsx
export default async function HomePage() {
  const categories = await getPopularCategories();
  const products = await getFeaturedProducts();

  return (
    <main>
      {/* Render your UI */}
    </main>
  );
}
```

## 📁 File Contoh

Lihat file `src/app/EXAMPLE-landing-page.tsx` untuk contoh implementasi lengkap dengan:
- Hero section
- Kategori populer grid
- Produk unggulan grid
- Styling dengan Tailwind CSS
- Next.js Image optimization

## 🎨 Yang Perlu Disiapkan Frontend

### 1. Hero Image
- Taruh image di: `/public/images/hero.jpg`
- Ukuran recommended: 1920x600px
- Format: JPG atau WebP

### 2. Category Images (Optional)
Saat ini category image masih `null`. Anda bisa:
- Upload via admin panel (nanti)
- Atau gunakan placeholder images sementara

### 3. Component Structure

Buat komponen reusable:
```
src/components/
  ├── CategoryCard.tsx
  ├── ProductCard.tsx
  └── HeroSection.tsx
```

## 🔧 TypeScript Types

Types sudah di-export dari server actions file:

```typescript
import type { 
  PopularCategory, 
  FeaturedProduct 
} from "@/app/actions/landing-page";
```

## 📊 Data Response

### Popular Categories
```typescript
[
  {
    id: 1,
    name: "Gitar Akustik",
    slug: "gitar-akustik",
    image: null,
    _count: { products: 5 },
    totalOrderItems: 9
  }
  // ... 2 more
]
```

### Featured Products
```typescript
[
  {
    id: "uuid",
    name: "Bass Series 15",
    slug: "bass-series-15-15",
    price: 9000000,
    stock: 10,
    image: "https://...",
    category: {
      id: 3,
      name: "Bass",
      slug: "bass"
    }
  }
  // ... 3 more
]
```

## 🚀 Next Steps

1. Copy `EXAMPLE-landing-page.tsx` ke `app/page.tsx`
2. Modifikasi styling sesuai design
3. Tambahkan hero image ke `/public/images/`
4. Test di browser: `npm run dev`

## 💡 Tips

- Server actions otomatis cached oleh Next.js
- Data di-fetch di server side (SEO friendly)
- No loading state needed untuk initial page load
- Untuk real-time updates, bisa gunakan `revalidatePath`

## ❓ Troubleshooting

**Q: Error "Cannot find module '@/app/actions/landing-page'"**
A: Pastikan file `src/app/actions/landing-page.ts` exists dan dev server sudah restart

**Q: Images tidak muncul**
A: Check path image di `/public/` dan gunakan Next.js `<Image>` component

**Q: TypeScript errors**
A: Run `npx prisma generate` untuk regenerate Prisma types
