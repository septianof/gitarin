import Image from "next/image";
import { Music } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden">
            {/* Left Side - Image (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black items-end justify-start overflow-hidden">
                <Image
                    src="/images/auth.jpg"
                    alt="Guitar"
                    fill
                    className="object-cover opacity-80 grayscale contrast-125"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Logo on top */}
                <div className="absolute top-8 left-8 z-10 flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
                        <Music className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-xl font-bold tracking-tight">Gitarin</span>
                </div>

                {/* Text at bottom */}
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h3 className="text-4xl font-bold tracking-tight mb-4">
                        Temukan Nada Sempurna Anda.
                    </h3>
                    <p className="text-lg text-gray-300">
                        Bergabunglah dengan komunitas musisi terbesar dan temukan alat musik impian Anda dengan kualitas terbaik.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-6 py-12 lg:px-20 xl:px-32 overflow-y-auto min-h-screen">
                {children}
            </div>
        </div>
    );
}
