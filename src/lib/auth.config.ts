import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role as Role;
                token.photo = user.photo;
            }
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.photo) token.photo = session.photo;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.photo = token.photo as string | null;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = auth?.user?.role;

            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
            const isOnPublic = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/produk");
            const isOnCustomerArea = nextUrl.pathname.startsWith("/profil") || nextUrl.pathname.startsWith("/cart") || nextUrl.pathname.startsWith("/pembayaran");

            // 1. Dashboard Access (Admin/Gudang Only)
            if (isOnDashboard) {
                if (isLoggedIn && (role === "ADMIN" || role === "GUDANG")) return true;
                return false; // Redirect to login or home
            }

            // 2. Auth Pages (Login/Register)
            if (isOnAuth) {
                if (isLoggedIn) {
                    // Redirect based on role
                    if (role === "ADMIN" || role === "GUDANG") {
                        return Response.redirect(new URL("/dashboard", nextUrl));
                    }
                    return Response.redirect(new URL("/", nextUrl));
                }
                return true;
            }

            // 3. Customer Areas (Profil, Cart, Checkout)
            if (isOnCustomerArea) {
                if (isLoggedIn) {
                    // Block Admin/Gudang from Customer Areas
                    if (role === "ADMIN" || role === "GUDANG") {
                        return Response.redirect(new URL("/dashboard", nextUrl));
                    }
                    return true;
                }
                return false; // Redirect to login
            }

            return true;
        },
    },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
