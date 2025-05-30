'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className={`text-lg font-semibold ${isActive('/') ? 'text-blue-400' : 'hover:text-gray-300'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/analytics"
              className={`text-lg font-semibold ${isActive('/analytics') ? 'text-blue-400' : 'hover:text-gray-300'}`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 