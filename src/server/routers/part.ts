import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const partRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        lowStock: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { isActive: true };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { partNumber: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.lowStock) {
        where.AND = {
          quantityInStock: {
            lte: ctx.prisma.part.fields.minStockLevel,
          },
        };
      }

      return ctx.prisma.part.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.part.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        partNumber: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive(),
        cost: z.number().positive().optional(),
        quantityInStock: z.number().int().min(0).default(0),
        minStockLevel: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.part.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        partNumber: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        cost: z.number().positive().optional(),
        quantityInStock: z.number().int().min(0).optional(),
        minStockLevel: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.part.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.part.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  adjustStock: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        adjustment: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const part = await ctx.prisma.part.findUnique({
        where: { id: input.id },
      });

      if (!part) {
        throw new Error('Part not found');
      }

      return ctx.prisma.part.update({
        where: { id: input.id },
        data: {
          quantityInStock: part.quantityInStock + input.adjustment,
        },
      });
    }),
});
