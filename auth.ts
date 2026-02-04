import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"
import { authConfig } from "./auth.config"

const CredentialsSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required")
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = CredentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        // The original code destructured email and password from parsed.data,
        // but the requested change uses credentials.email and credentials.password directly.
        // We will align with the requested change for the Prisma query and bcrypt.
        // const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }, // Use credentials.email directly
          include: { managedDepartments: { select: { id: true } } } // Include managedDepartments
        });

        if (!user) {
          // Changed error handling to return null instead of throwing an error
          return null;
        }

        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password);

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId,
            managedDepartmentIds: user.managedDepartments.map(d => d.id) // Add managedDepartmentIds
          };
        }

        // If passwords don't match, return null
        return null;
      },
    }),
  ],
})