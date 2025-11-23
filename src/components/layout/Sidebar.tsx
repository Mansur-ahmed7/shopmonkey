'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Package, 
  ClipboardList, 
  FileText, 
  Receipt,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Services', href: '/services', icon: Wrench },
  { name: 'Parts', href: '/parts', icon: Package },
  { name: 'Work Orders', href: '/work-orders', icon: ClipboardList },
  { name: 'Estimates', href: '/estimates', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
];

const StarSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 transition-transform group-hover:scale-110">
            <Image 
              src="/shopmonkey-logo.png" 
              alt="ShopMonkey Logo" 
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-gray-900">ShopMonkey</span>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative overflow-visible flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 group/nav',
                  isActive
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-transparent hover:text-[#0066FF] shadow-[0_0_0_#0066FF8c] hover:shadow-[0_0_15px_#0066FF8c] border-2 border-transparent hover:border-[#0066FF]'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                
                {/* Stars - only show on non-active items */}
                {!isActive && (
                  <>
                    <div className="absolute top-[20%] left-[20%] w-3 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0.05,0.83,0.43,0.96)] group-hover/nav:top-[-80%] group-hover/nav:left-[-30%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                    <div className="absolute top-[45%] left-[45%] w-2 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover/nav:top-[-25%] group-hover/nav:left-[10%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                    <div className="absolute top-[40%] left-[40%] w-1 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover/nav:top-[55%] group-hover/nav:left-[25%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                    <div className="absolute top-[20%] left-[40%] w-1.5 h-auto -z-10 transition-all duration-800 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover/nav:top-[30%] group-hover/nav:left-[80%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                    <div className="absolute top-[25%] left-[45%] w-2 h-auto -z-10 transition-all duration-600 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover/nav:top-[25%] group-hover/nav:left-[115%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                    <div className="absolute top-[5%] left-[50%] w-1 h-auto -z-10 transition-all duration-800 ease group-hover/nav:top-[5%] group-hover/nav:left-[60%] group-hover/nav:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover/nav:drop-shadow-[0_0_10px_#fffdef]">
                      <StarSvg />
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-sm font-semibold text-white">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-red-50 hover:text-red-600"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#0066FF] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
