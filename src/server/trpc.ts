import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';
import { UserRole } from '@prisma/client';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await auth();
  
  return {
    session,
    prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== UserRole.ADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
