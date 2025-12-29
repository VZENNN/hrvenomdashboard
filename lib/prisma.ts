import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Fix for "prepared statement does not exist" error with PgBouncer/Supabase
const prismaClientSingleton = () => {
    let url = process.env.DATABASE_URL

    if (url && !url.includes('pgbouncer=true')) {
        // Append pgbouncer=true to the URL
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
    }

    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    })
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma