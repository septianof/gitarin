import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/app/actions/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

interface ProductDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Back Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/produk"
                        className="inline-flex items-center text-gray-500 hover:text-zinc-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Katalog
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Product Detail Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
                    {/* Product Image */}
                    <div className="lg:col-span-7">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <span className="text-gray-400 text-lg">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-5 flex flex-col justify-start">
                        <div className="mb-6">
                            {/* Product Name */}
                            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 leading-tight mb-4 tracking-tight">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <p className="text-2xl font-bold text-zinc-900">
                                Rp {Number(product.price).toLocaleString("id-ID")}
                            </p>
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray mb-8">
                            <p className="text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Stock Info */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">
                                Stok tersedia: <span className="font-semibold text-zinc-900">{product.stock} unit</span>
                            </p>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Tambah ke Keranjang
                        </Button>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-8">Produk Terkait</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
