import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

export const invoiceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(InvoiceStatus).optional(),
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

      return ctx.prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          workOrder: {
            include: {
              vehicle: true,
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
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.invoice.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          workOrder: {
            include: {
              vehicle: true,
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
          },
        },
      });
    }),

  createFromWorkOrder: protectedProcedure
    .input(
      z.object({
        workOrderId: z.string(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workOrder = await ctx.prisma.workOrder.findUnique({
        where: { id: input.workOrderId },
        include: {
          services: true,
          parts: true,
        },
      });

      if (!workOrder) {
        throw new Error('Work order not found');
      }

      const count = await ctx.prisma.invoice.count();
      const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

      const servicesTotal = workOrder.services.reduce(
        (sum, s) => sum + s.price * s.quantity,
        0
      );
      const partsTotal = workOrder.parts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      const subtotal = servicesTotal + partsTotal;
      const tax = subtotal * 0.08; // 8% tax rate
      const total = subtotal + tax;

      const invoice = await ctx.prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: workOrder.customerId,
          workOrderId: input.workOrderId,
          createdById: ctx.session.user.id,
          status: InvoiceStatus.UNPAID,
          subtotal,
          tax,
          total,
          amountPaid: 0,
          dueDate: input.dueDate,
          notes: input.notes,
        },
      });

      return invoice;
    }),

  recordPayment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
        paymentMethod: z.nativeEnum(PaymentMethod),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.id },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const newAmountPaid = invoice.amountPaid + input.amount;
      const isPaid = newAmountPaid >= invoice.total;
      const isPartial = newAmountPaid > 0 && newAmountPaid < invoice.total;

      return ctx.prisma.invoice.update({
        where: { id: input.id },
        data: {
          amountPaid: newAmountPaid,
          paymentMethod: input.paymentMethod,
          status: isPaid ? InvoiceStatus.PAID : isPartial ? InvoiceStatus.PARTIAL : InvoiceStatus.UNPAID,
          paidAt: isPaid ? new Date() : null,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(InvoiceStatus).optional(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.invoice.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.invoice.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
