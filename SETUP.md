# Shopmonkey Clone - Auto Repair Shop Management System

A complete auto repair shop management system built for a university project, inspired by Shopmonkey.io.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ with App Router and TypeScript
- **API**: tRPC for end-to-end type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with JWT and role-based access control
- **UI**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod for schema validation

## 📦 What's Built

### ✅ Complete Infrastructure
- **Authentication System**: Secure login with role-based access (Admin, Service Advisor, Technician)
- **Database Schema**: 12+ tables with proper relationships
  - Users with role permissions
  - Customers and Vehicles
  - Work Orders with service/part tracking
  - Service Catalog
  - Parts Inventory with stock management
  - Estimates and Invoices
- **tRPC API**: Fully typed API routes for all entities (8 routers)
- **Dashboard**: Main navigation page

### 🚧 Ready to Build
- Customer/Vehicle Management UI pages
- Work Order creation and tracking
- Service & Parts catalog pages
- Estimate & Invoice generation
- PDF export
- Advanced reporting

## 🎯 Quick Start

### The app is already running! ✅

**Server**: http://localhost:3000

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@shopmonkey.local | admin123 |
| **Service Advisor** | advisor@shopmonkey.local | advisor123 |
| **Technician** | tech@shopmonkey.local | tech123 |

### What's Working Now
1. ✅ Login page with authentication
2. ✅ Dashboard with module overview
3. ✅ Database with sample services and parts
4. ✅ All backend APIs ready via tRPC

### Database Details
- **Database Name**: shopmonkey_db
- **PostgreSQL Connection**: localhost:5432
- **Password**: 5252
- **Sample Data**: Users, Services, and Parts already seeded

## 📁 Key Files

```
c:\shopmonkey/
├── src/server/routers/     # All tRPC API endpoints
│   ├── customer.ts         # Customer CRUD
│   ├── vehicle.ts          # Vehicle CRUD
│   ├── workOrder.ts        # Work order management
│   ├── service.ts          # Service catalog
│   ├── part.ts             # Parts inventory
│   ├── estimate.ts         # Estimates
│   └── invoice.ts          # Invoicing
├── src/app/
│   ├── dashboard/          # Main dashboard ✅
│   ├── login/              # Login page ✅
│   └── api/trpc/           # tRPC endpoint ✅
└── prisma/schema.prisma    # Complete database schema ✅
```

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Already running!

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run new migrations

# Add UI components
npx shadcn@latest add [component-name]
```

## 🗃️ Database Schema Highlights

### Users & Auth
- 3 role types: ADMIN, SERVICE_ADVISOR, TECHNICIAN
- Secure password hashing with bcrypt
- JWT-based sessions

### Work Orders
- Status: PENDING → IN_PROGRESS → COMPLETED → CANCELLED
- Links customers, vehicles, services, and parts
- Automatic inventory deduction

### Invoicing
- Status: UNPAID → PARTIAL → PAID → OVERDUE
- Payment methods: CASH, CHECK, CARD, FINANCING
- Auto-calculated totals with 8% tax

## 📝 Next Development Steps

1. **Customer Page**: Build `src/app/customers/page.tsx`
   - Use `trpc.customer.getAll.useQuery()` to fetch
   - Table view with add/edit/delete buttons
   
2. **Vehicle Page**: Build `src/app/vehicles/page.tsx`
   - Link vehicles to customers
   - Display service history

3. **Work Orders**: Build `src/app/work-orders/page.tsx`
   - Create orders with service/part selection
   - Status tracking workflow

4. **Services/Parts**: Management pages for catalog

5. **Estimates & Invoices**: Generation and PDF export

## 🎨 UI Components Available

All Shadcn/ui components installed:
- `Button`, `Input`, `Label`
- `Card`, `Table`, `Dialog`
- `Form`, `Select`, `Textarea`
- `Badge`, `Dropdown Menu`

## 🚨 Important Notes

- **TypeScript**: Full end-to-end type safety with tRPC
- **No API errors**: tRPC automatically validates all requests/responses
- **Auto-complete**: Your IDE will autocomplete all API calls
- **Database**: Already migrated and seeded with sample data

## 🎓 What This Demonstrates

✅ Modern full-stack architecture  
✅ Type-safe API design  
✅ Proper database modeling  
✅ Authentication & authorization  
✅ Role-based access control  
✅ Professional UI components  
✅ Production-ready code structure  

## 📖 Learning Resources

- **tRPC**: https://trpc.io/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://authjs.dev/
- **Shadcn/ui**: https://ui.shadcn.com/

---

**Status**: Backend Complete ✅ | Frontend UI Ready to Build 🚀

**Your server is running at**: http://localhost:3000  
**Login and explore the dashboard!**
