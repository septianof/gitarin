import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Matcher: Filter routes to run middleware on
    // Exclude static files, images, api routes that don't need auth (optional), etc.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
