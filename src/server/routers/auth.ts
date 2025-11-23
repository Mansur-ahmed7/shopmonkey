import { z } from 'zod';
import { hash } from 'bcryptjs';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { UserRole } from '@prisma/client';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        role: z.nativeEnum(UserRole).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      const hashedPassword = await hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role || UserRole.SERVICE_ADVISOR,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return user;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  getUsers: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),
});
