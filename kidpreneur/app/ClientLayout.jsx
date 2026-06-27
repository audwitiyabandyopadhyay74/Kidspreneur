'use client';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Always show navbar for now
  const showNavbar = true;

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
