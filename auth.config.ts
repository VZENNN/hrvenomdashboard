import type { NextAuthConfig } from "next-auth"

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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    providers: [], // Providers with dependencies (like Credentials + Bcrypt) will be added in auth.ts
} satisfies NextAuthConfig;
