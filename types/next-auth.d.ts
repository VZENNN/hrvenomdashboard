
import { Role } from "@prisma/client";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in session type
declare module "next-auth" {
    interface Session {
        user: {
            role: Role;
            departmentId: string | null;
            managedDepartmentIds: string[];
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: Role;
        departmentId: string | null;
        managedDepartmentIds: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        departmentId: string | null;
        managedDepartmentIds: string[];
    }
}
