import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        role: Role;
        photo?: string | null;
    }
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: Role;
            photo?: string | null;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string;
        role: Role;
        photo?: string | null;
    }
}

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
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
                    photo: user.photo,
                };
            },
        }),
    ],
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
