import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Resilient Prisma operation wrapper.
 * Automatically handles transient cloud database drops/timeouts (e.g. Aiven idle connection timeouts)
 * by retrying the query once after a brief delay.
 * Preserves the stable singleton connection pool without disruptive teardowns.
 */
export async function withPrismaRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err: any) {
    const msg = String(err?.message || '');
    const isConnErr =
      msg.includes('closed') ||
      msg.includes('10054') ||
      msg.includes('Connection') ||
      msg.includes('connection') ||
      msg.includes("Can't reach database server") ||
      msg.includes('timed out');

    if (isConnErr) {
      console.warn('Prisma transient connection issue encountered. Retrying query...', msg);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return await operation();
    }
    throw err;
  }
}

export default prisma;

