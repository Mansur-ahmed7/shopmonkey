import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { WorkOrderStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const workOrderRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(WorkOrderStatus).optional(),
        customerId: z.string().optional(),
        assignedToId: z.string().optional(),
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

      if (input.assignedToId) {
        where.assignedToId = input.assignedToId;
      }

      return ctx.prisma.workOrder.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
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
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workOrder = await ctx.prisma.workOrder.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          vehicle: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
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

      if (!workOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order not found',
        });
      }

      return workOrder;
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        vehicleId: z.string(),
        assignedToId: z.string().optional(),
        description: z.string().optional(),
        customerNotes: z.string().optional(),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate work order number
      const count = await ctx.prisma.workOrder.count();
      const workOrderNumber = `WO-${String(count + 1).padStart(6, '0')}`;

      const workOrder = await ctx.prisma.workOrder.create({
        data: {
          ...input,
          workOrderNumber,
          createdById: ctx.session.user.id,
          status: WorkOrderStatus.PENDING,
        },
        include: {
          customer: true,
          vehicle: true,
        },
      });

      return workOrder;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedToId: z.string().optional(),
        status: z.nativeEnum(WorkOrderStatus).optional(),
        description: z.string().optional(),
        customerNotes: z.string().optional(),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const updateData: any = { ...data };

      // Set timestamps based on status changes
      if (data.status === WorkOrderStatus.IN_PROGRESS && !updateData.startedAt) {
        updateData.startedAt = new Date();
      } else if (data.status === WorkOrderStatus.COMPLETED && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }

      return ctx.prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          vehicle: true,
          assignedTo: true,
        },
      });
    }),

  addService: protectedProcedure
    .input(
      z.object({
        workOrderId: z.string(),
        serviceId: z.string(),
        quantity: z.number().int().positive().default(1),
        price: z.number().positive(),
        laborHours: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workOrderService.create({
        data: input,
      });
    }),

  removeService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.workOrderService.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  addPart: protectedProcedure
    .input(
      z.object({
        workOrderId: z.string(),
        partId: z.string(),
        quantity: z.number().int().positive().default(1),
        price: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check part availability
      const part = await ctx.prisma.part.findUnique({
        where: { id: input.partId },
      });

      if (!part) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Part not found',
        });
      }

      if (part.quantityInStock < input.quantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient stock',
        });
      }

      // Create work order part and update inventory
      const [workOrderPart] = await ctx.prisma.$transaction([
        ctx.prisma.workOrderPart.create({
          data: input,
        }),
        ctx.prisma.part.update({
          where: { id: input.partId },
          data: {
            quantityInStock: {
              decrement: input.quantity,
            },
          },
        }),
      ]);

      return workOrderPart;
    }),

  removePart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workOrderPart = await ctx.prisma.workOrderPart.findUnique({
        where: { id: input.id },
      });

      if (!workOrderPart) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order part not found',
        });
      }

      // Delete work order part and restore inventory
      await ctx.prisma.$transaction([
        ctx.prisma.workOrderPart.delete({
          where: { id: input.id },
        }),
        ctx.prisma.part.update({
          where: { id: workOrderPart.partId },
          data: {
            quantityInStock: {
              increment: workOrderPart.quantity,
            },
          },
        }),
      ]);

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Restore inventory for all parts before deleting
      const workOrderParts = await ctx.prisma.workOrderPart.findMany({
        where: { workOrderId: input.id },
      });

      await ctx.prisma.$transaction([
        ...workOrderParts.map((wop) =>
          ctx.prisma.part.update({
            where: { id: wop.partId },
            data: {
              quantityInStock: {
                increment: wop.quantity,
              },
            },
          })
        ),
        ctx.prisma.workOrder.delete({
          where: { id: input.id },
        }),
      ]);

      return { success: true };
    }),
});
