import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        role: Role;
    }
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: Role;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string;
        role: Role;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email dan password harus diisi");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) {
                    throw new Error("Email atau password salah");
                }

                if (user.deletedAt) {
                    throw new Error("Akun tidak aktif");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Email atau password salah");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
});

// Helper function to get redirect URL based on role
export function getRedirectUrl(role: Role): string {
    switch (role) {
        case "ADMIN":
        case "GUDANG":
            return "/dashboard";
        case "CUSTOMER":
        default:
            return "/";
    }
}
