import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { customerRouter } from './routers/customer';
import { vehicleRouter } from './routers/vehicle';
import { serviceRouter } from './routers/service';
import { partRouter } from './routers/part';
import { workOrderRouter } from './routers/workOrder';
import { estimateRouter } from './routers/estimate';
import { invoiceRouter } from './routers/invoice';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  customer: customerRouter,
  vehicle: vehicleRouter,
  service: serviceRouter,
  part: partRouter,
  workOrder: workOrderRouter,
  estimate: estimateRouter,
  invoice: invoiceRouter,
});

export type AppRouter = typeof appRouter;
