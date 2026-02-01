import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart, Truck, CheckCircle, Headphones, Music } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getPopularCategories, getFeaturedProducts } from "@/app/actions/landing-page";

export default async function Home() {
  // Fetch data
  const [popularCategories, featuredProducts] = await Promise.all([
    getPopularCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <main className="min-h-screen">
      {/* ============================================ */}
      {/*               HERO SECTION                  */}
      {/* ============================================ */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-zinc-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Temukan Harmoni</span>{" "}
                  <span className="block text-gray-500 xl:inline">Sempurna Anda</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Koleksi eksklusif gitar premium untuk musisi yang menghargai kualitas suara dan estetika. Dari akustik klasik hingga elektrik modern.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/produk"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 md:py-4 md:text-lg md:px-10 transition"
                    >
                      Belanja Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative h-56 w-full sm:h-72 md:h-96 lg:h-full">
            <Image
              src="/images/hero.jpeg"
              alt="Musician playing guitar"
              fill
              className="object-cover transition-all duration-700 grayscale hover:grayscale-0"
              priority
            />
            {/* Gradient Overlay left-to-right to blend with white background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent lg:via-white/20"></div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/*          KATEGORI POPULER SECTION           */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-zinc-900 font-semibold tracking-wide uppercase">Kategori Populer</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Pilih Gaya Bermainmu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCategories.map((category) => (
              <Link href={`/produk?categoryId=${category.id}`} key={category.id}>
                <div className="relative group rounded-xl overflow-hidden h-64 shadow-md cursor-pointer">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    // Fallback using random gradient if no image
                    <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                      <Music className="w-12 h-12 text-zinc-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                    <p className="text-gray-200 text-sm mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Lihat {category._count.products} Produk <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/*         PRODUK UNGGULAN SECTION             */}
      {/* ============================================ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Produk Unggulan</h2>
              <p className="mt-2 text-gray-500">Pilihan terbaik minggu ini untuk para profesional.</p>
            </div>
            <Link href="/produk" className="hidden sm:flex items-center text-zinc-900 font-medium hover:underline">
              Lihat Semua <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Link
              href="/produk"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-zinc-900 bg-white hover:bg-gray-50"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/*            FEATURES SECTION                 */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Pengiriman Cepat</h3>
              <p className="text-sm text-gray-500">
                Layanan pengiriman ekspres ke seluruh Indonesia dengan packing kayu aman.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Kualitas Terjamin</h3>
              <p className="text-sm text-gray-500">
                Produk 100% original dengan garansi resmi dan inspeksi kualitas ketat.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Layanan Pelanggan 24/7</h3>
              <p className="text-sm text-gray-500">
                Tim ahli kami siap membantu konsultasi dan pertanyaan Anda kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
