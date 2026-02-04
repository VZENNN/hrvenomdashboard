import type { NextAuthConfig } from "next-auth"
import { Role } from "@prisma/client"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnApplicant = nextUrl.pathname.startsWith('/applicant');
            const isOnApi = nextUrl.pathname.startsWith('/api');

            if (isOnDashboard) {
                if (isLoggedIn) {
                    if (auth.user.role === 'APPLICANT') return Response.redirect(new URL('/applicant/dashboard', nextUrl));
                    return true;
                }
                return false;
            }

            if (isOnApplicant) {
                if (isLoggedIn) {
                    // Only Applicant and Admin can access applicant routes? Or just Applicant? 
                    // Let's allow Admin to debug too, or restric strict.
                    // Requirement: Applicant can ONLY access Psychotest.
                    // If Admin tries to see Applicant view, maybe allow it.
                    return true;
                }
                return false;
            }

            if (isOnApi) {
                if (isLoggedIn) return true;
                return false;
            }

            if (isLoggedIn) {
                // Default redirect for logged in users at root
                if (nextUrl.pathname === '/') {
                    if (auth.user.role === 'APPLICANT') return Response.redirect(new URL('/applicant/dashboard', nextUrl));
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.departmentId = user.departmentId;
                token.managedDepartmentIds = user.managedDepartmentIds;
            }
            // Support updating session on client side
            if (trigger === "update" && session) {
                token = { ...token, ...session }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as Role;
                session.user.departmentId = token.departmentId as string | null;
                session.user.managedDepartmentIds = (token.managedDepartmentIds as string[]) || [];
            }
            return session;
        },
    },
    providers: [], // Providers with dependencies (like Credentials + Bcrypt) will be added in auth.ts
} satisfies NextAuthConfig;
