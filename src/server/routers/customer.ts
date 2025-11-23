import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const customerRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).default(50).optional(),
        cursor: z.string().optional(),
      }).optional().default({})
    )
    .query(async ({ ctx, input }) => {
      const { search, limit = 50, cursor } = input;

      const where = search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
            ],
          }
        : {};

      const customers = await ctx.prisma.customer.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicles: true,
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (customers.length > limit) {
        const nextItem = customers.pop();
        nextCursor = nextItem!.id;
      }

      return {
        customers,
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          vehicles: true,
          workOrders: {
            include: {
              vehicle: true,
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }

      return customer;
    }),

  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.create({
        data: {
          ...input,
          email: input.email || null,
        },
      });

      return customer;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().min(1).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const customer = await ctx.prisma.customer.update({
        where: { id },
        data: {
          ...data,
          email: data.email || null,
        },
      });

      return customer;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.customer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
