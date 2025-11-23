import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { EstimateStatus } from '@prisma/client';

export const estimateRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(EstimateStatus).optional(),
        customerId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.customerId) {
        where.customerId = input.customerId;
      }

      return ctx.prisma.estimate.findMany({
        where,
        include: {
          customer: true,
          services: {
            include: {
              service: true,
            },
          },
          parts: {
            include: {
              part: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.estimate.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          workOrder: {
            include: {
              vehicle: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          parts: {
            include: {
              part: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        workOrderId: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        validUntil: z.date().optional(),
        taxRate: z.number().min(0).max(1).default(0.08),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.prisma.estimate.count();
      const estimateNumber = `EST-${String(count + 1).padStart(6, '0')}`;

      const { taxRate, ...estimateData } = input;

      const estimate = await ctx.prisma.estimate.create({
        data: {
          ...estimateData,
          estimateNumber,
          createdById: ctx.session.user.id,
          status: EstimateStatus.DRAFT,
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      });

      return estimate;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(EstimateStatus).optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        validUntil: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.estimate.update({
        where: { id },
        data,
      });
    }),

  addService: protectedProcedure
    .input(
      z.object({
        estimateId: z.string(),
        serviceId: z.string(),
        quantity: z.number().int().positive().default(1),
        price: z.number().positive(),
        laborHours: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.prisma.estimateService.create({
        data: input,
      });

      await recalculateTotal(ctx, input.estimateId);

      return service;
    }),

  addPart: protectedProcedure
    .input(
      z.object({
        estimateId: z.string(),
        partId: z.string(),
        quantity: z.number().int().positive().default(1),
        price: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const part = await ctx.prisma.estimatePart.create({
        data: input,
      });

      await recalculateTotal(ctx, input.estimateId);

      return part;
    }),

  removeService: protectedProcedure
    .input(z.object({ id: z.string(), estimateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.estimateService.delete({
        where: { id: input.id },
      });

      await recalculateTotal(ctx, input.estimateId);

      return { success: true };
    }),

  removePart: protectedProcedure
    .input(z.object({ id: z.string(), estimateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.estimatePart.delete({
        where: { id: input.id },
      });

      await recalculateTotal(ctx, input.estimateId);

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.estimate.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

async function recalculateTotal(ctx: any, estimateId: string) {
  const estimate = await ctx.prisma.estimate.findUnique({
    where: { id: estimateId },
    include: {
      services: true,
      parts: true,
    },
  });

  if (!estimate) return;

  const servicesTotal = estimate.services.reduce(
    (sum: number, s: any) => sum + s.price * s.quantity,
    0
  );
  const partsTotal = estimate.parts.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + tax;

  await ctx.prisma.estimate.update({
    where: { id: estimateId },
    data: {
      subtotal,
      tax,
      total,
    },
  });
}
