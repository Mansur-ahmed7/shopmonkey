# ShopMonkey - Auto Repair Shop Management System

A complete auto repair shop management system built with Next.js, tRPC, Prisma, and PostgreSQL.

## Features

- 👥 **Customer Management** - Track customer information and contact details
- 🚗 **Vehicle Management** - Manage customer vehicles with detailed specs
- 🔧 **Services** - Define and manage repair services
- 🛠️ **Parts Inventory** - Track parts and inventory
- 📋 **Work Orders** - Create and manage repair work orders
- 💰 **Estimates** - Generate customer estimates
- 🧾 **Invoices** - Create invoices and track payments
- 🖨️ **Print Receipts** - Print professional receipts for customers
- ✨ **Animated UI** - Custom star button effects and loading animations

## Tech Stack

- **Framework:** Next.js 16.0.3 (App Router)
- **Language:** TypeScript
- **API:** tRPC 11.7.1
- **Database:** PostgreSQL with Prisma 6.19.0
- **Authentication:** NextAuth v5
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/ui

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/Mansur-ahmed7/shopmonkey.git
cd shopmonkey
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/shopmonkey_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
shopmonkey/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── customers/
│   │   ├── vehicles/
│   │   ├── services/
│   │   ├── parts/
│   │   ├── work-orders/
│   │   ├── estimates/
│   │   └── invoices/
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utilities and configurations
│   └── server/
│       └── routers/          # tRPC API routes
└── public/                   # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

## License

This project is for educational purposes.

## Acknowledgments

- UI inspiration from [WaxyWeb](https://www.waxyweb.agency/)
- Component animations from [Uiverse.io](https://uiverse.io/)
