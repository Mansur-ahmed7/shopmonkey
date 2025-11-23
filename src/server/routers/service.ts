import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const serviceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.isActive !== undefined ? { isActive: input.isActive } : {};

      return ctx.prisma.service.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.service.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        defaultPrice: z.number().positive(),
        laborHours: z.number().positive().default(1),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.service.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        defaultPrice: z.number().positive().optional(),
        laborHours: z.number().positive().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.service.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.service.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
