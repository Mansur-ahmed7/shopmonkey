import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const vehicleRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.customerId) {
        where.customerId = input.customerId;
      }

      if (input.search) {
        where.OR = [
          { make: { contains: input.search, mode: 'insensitive' } },
          { model: { contains: input.search, mode: 'insensitive' } },
          { vin: { contains: input.search, mode: 'insensitive' } },
          { licensePlate: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      return ctx.prisma.vehicle.findMany({
        where,
        include: {
          customer: true,
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vehicle = await ctx.prisma.vehicle.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          workOrders: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!vehicle) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vehicle not found',
        });
      }

      return vehicle;
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        vin: z.string().optional(),
        year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
        make: z.string().min(1),
        model: z.string().min(1),
        color: z.string().optional(),
        licensePlate: z.string().optional(),
        mileage: z.number().int().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vehicle = await ctx.prisma.vehicle.create({
        data: input,
      });

      return vehicle;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        vin: z.string().optional(),
        year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
        make: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        color: z.string().optional(),
        licensePlate: z.string().optional(),
        mileage: z.number().int().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const vehicle = await ctx.prisma.vehicle.update({
        where: { id },
        data,
      });

      return vehicle;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.vehicle.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
