'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface TopNavProps {
  cartCount: number;
  bookingsCount: number;
  onNavigateSection: (sectionId: 'parts' | 'mechanics' | 'standards') => void;
  onOpenRegisterMechanic: () => void;
  onOpenDrawer: (tab: 'cart' | 'bookings') => void;
}

export default function TopNav({
  cartCount,
  bookingsCount,
  onNavigateSection,
  onOpenRegisterMechanic,
  onOpenDrawer,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-zinc-900 border-b border-zinc-800 text-zinc-100">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        className="text-xl font-bold tracking-tight text-amber-500 font-display whitespace-nowrap shrink-0"
      >
        SaloneAutoHub
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300"
      >
        <button
          type="button"
          onClick={() => onNavigateSection('parts')}
          className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Spare Parts
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('mechanics')}
          className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Certified Mechanics
        </button>
        <button
          type="button"
          onClick={onOpenRegisterMechanic}
          className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Register Workshop
        </button>
        <button
          type="button"
          onClick={() => onOpenDrawer('bookings')}
          className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono"
        >
          My Bookings ({bookingsCount})
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => onOpenDrawer('cart')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-md hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Parts Cart ({cartCount})</span>
        </button>
      </div>
    </header>
  );
}
