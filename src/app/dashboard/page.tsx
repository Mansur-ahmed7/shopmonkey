import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MainLayout from "@/components/layout/MainLayout";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch real data from database
  const [
    workOrders,
    customers,
    invoices,
    recentWorkOrders,
  ] = await Promise.all([
    prisma.workOrder.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      select: {
        id: true,
        status: true,
        total: true,
        amountPaid: true,
        createdAt: true,
      },
    }),
    prisma.workOrder.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
          },
        },
      },
    }),
  ]);

  // Calculate stats
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalWorkOrders = workOrders.length;
  const lastMonthWorkOrders = workOrders.filter(wo => wo.createdAt < lastMonth).length;
  const workOrderGrowth = lastMonthWorkOrders > 0 
    ? (((totalWorkOrders - lastMonthWorkOrders) / lastMonthWorkOrders) * 100).toFixed(0)
    : '0';

  const activeCustomers = customers.length;
  const lastMonthCustomers = customers.filter(c => c.createdAt < lastMonth).length;
  const customerGrowth = lastMonthCustomers > 0
    ? (((activeCustomers - lastMonthCustomers) / lastMonthCustomers) * 100).toFixed(0)
    : '0';

  const thisMonthRevenue = invoices
    .filter(inv => inv.createdAt >= thisMonthStart && inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const lastMonthRevenue = invoices
    .filter(inv => inv.createdAt >= lastMonth && inv.createdAt < thisMonthStart && inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const revenueGrowth = lastMonthRevenue > 0
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(0)
    : '0';

  const pendingInvoices = invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIAL').length;
  const lastMonthPending = invoices.filter(inv => 
    inv.createdAt < lastMonth && (inv.status === 'UNPAID' || inv.status === 'PARTIAL')
  ).length;
  const pendingChange = lastMonthPending > 0
    ? (((pendingInvoices - lastMonthPending) / lastMonthPending) * 100).toFixed(0)
    : '0';

  // Calculate performance metrics
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const completionRate = totalWorkOrders > 0 
    ? ((completedWorkOrders / totalWorkOrders) * 100).toFixed(0)
    : '0';

  const stats = {
    workOrders: {
      value: totalWorkOrders,
      change: `${Number(workOrderGrowth) >= 0 ? '+' : ''}${workOrderGrowth}%`,
      trend: (Number(workOrderGrowth) >= 0 ? 'up' : 'down') as 'up' | 'down',
    },
    customers: {
      value: activeCustomers,
      change: `${Number(customerGrowth) >= 0 ? '+' : ''}${customerGrowth}%`,
      trend: (Number(customerGrowth) >= 0 ? 'up' : 'down') as 'up' | 'down',
    },
    revenue: {
      value: thisMonthRevenue,
      change: `${Number(revenueGrowth) >= 0 ? '+' : ''}${revenueGrowth}%`,
      trend: (Number(revenueGrowth) >= 0 ? 'up' : 'down') as 'up' | 'down',
    },
    pendingInvoices: {
      value: pendingInvoices,
      change: `${Number(pendingChange) >= 0 ? '+' : ''}${pendingChange}%`,
      trend: (Number(pendingChange) < 0 ? 'up' : 'down') as 'up' | 'down', // negative is good for pending
    },
    completionRate: Number(completionRate),
  };

  const recentActivity = recentWorkOrders.map(wo => ({
    id: wo.id,
    workOrderNumber: wo.workOrderNumber,
    customerName: `${wo.customer.firstName} ${wo.customer.lastName}`,
    vehicleName: `${wo.vehicle.make} ${wo.vehicle.model}`,
    status: wo.status,
    updatedAt: wo.updatedAt,
  }));

  return (
    <MainLayout>
      <DashboardClient 
        userName={session.user.name || 'User'}
        stats={stats}
        recentActivity={recentActivity}
      />
    </MainLayout>
  );
}
