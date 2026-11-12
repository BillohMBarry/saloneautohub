'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Wrench,
  Cog,
  Cpu,
  BatteryCharging,
  Gauge,
  ShieldCheck,
  Truck,
  Search,
  MapPin,
  Star,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  ShoppingBag,
  Award,
  Phone,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import TopNav from '@/components/TopNav';
import PartDetailModal from '@/components/PartDetailModal';
import MechanicBookingModal from '@/components/MechanicBookingModal';
import MechanicReviewModal from '@/components/MechanicReviewModal';
import RegisterMechanicModal from '@/components/RegisterMechanicModal';
import CartAndOrdersDrawer from '@/components/CartAndOrdersDrawer';
import {
  AutoPart,
  MechanicProfile,
  PartCategory,
  MechanicSpecialty,
  SierraLeoneDistrict,
  CartItem,
  ServiceBooking,
  PartOrder,
  filterPartsByVehicleAndQuery,
  checkPartCompatibility,
  filterMechanics,
  calculateMechanicRatingSummary,
  formatSLE,
} from '@/lib/marketplace-logic';
import {
  VEHICLE_CATALOG,
  SIERRA_LEONE_DISTRICTS,
  INITIAL_PARTS,
  INITIAL_MECHANICS,
  INITIAL_BOOKINGS,
} from '@/lib/seed-data';

const PART_CATEGORIES: PartCategory[] = [
  'All',
  'Electrical Systems',
  'Engine Diagnostics & Fuel',
  'Transmission & Clutch',
  'Brakes & 4x4 Suspension',
  'Cooling & AC Systems',
];

const MECHANIC_SPECIALTIES: {
  label: MechanicSpecialty;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: 'All', icon: Wrench },
  { label: 'Electrical Systems', icon: BatteryCharging },
  { label: 'Engine Diagnostics', icon: Cpu },
  { label: 'Transmission Repair', icon: Cog },
  { label: 'Brakes & 4x4 Suspension', icon: Gauge },
  { label: 'AC & Cooling Systems', icon: SlidersHorizontal },
];

export default function SaloneAutoHubPage() {
  // Catalog & Directory State
  const [parts] = useState<AutoPart[]>(INITIAL_PARTS);
  const [mechanics, setMechanics] = useState<MechanicProfile[]>(INITIAL_MECHANICS);

  // Vehicle Fitment Filter State
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedPartCategory, setSelectedPartCategory] = useState<PartCategory>('All');
  const [selectedPartDistrict, setSelectedPartDistrict] =
    useState<SierraLeoneDistrict>('All Locations');
  const [partSearchQuery, setPartSearchQuery] = useState<string>('');

  // Mechanic Directory Filter State
  const [selectedSpecialty, setSelectedSpecialty] = useState<MechanicSpecialty>('All');
  const [selectedMechanicDistrict, setSelectedMechanicDistrict] =
    useState<SierraLeoneDistrict>('All Locations');
  const [mobileDispatchOnly, setMobileDispatchOnly] = useState<boolean>(false);
  const [minMechanicRating, setMinMechanicRating] = useState<number>(0);
  const [mechanicSearchQuery, setMechanicSearchQuery] = useState<string>('');

  // Cart, Bookings & Orders State
  const [cart, setCart] = useState<CartItem[]>([
    { part: INITIAL_PARTS[0], quantity: 1 },
  ]);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [orders, setOrders] = useState<PartOrder[]>([]);

  // Active Modals & Drawers
  const [inspectedPart, setInspectedPart] = useState<AutoPart | null>(null);
  const [bookingMechanic, setBookingMechanic] = useState<MechanicProfile | null>(null);
  const [reviewingMechanic, setReviewingMechanic] = useState<MechanicProfile | null>(
    null
  );
  const [isRegisterMechanicOpen, setIsRegisterMechanicOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'cart' | 'bookings'>('cart');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Derived Vehicle Dropdown Options
  const availableMakes = useMemo(() => Object.keys(VEHICLE_CATALOG), []);
  const availableModels = useMemo(() => {
    if (!selectedMake || !VEHICLE_CATALOG[selectedMake]) return [];
    return Object.keys(VEHICLE_CATALOG[selectedMake]);
  }, [selectedMake]);

  const availableYears = useMemo(() => {
    if (
      !selectedMake ||
      !selectedModel ||
      !VEHICLE_CATALOG[selectedMake]?.[selectedModel]
    ) {
      return [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012];
    }
    return VEHICLE_CATALOG[selectedMake][selectedModel];
  }, [selectedMake, selectedModel]);

  // Filtered Parts
  const filteredParts = useMemo(
    () =>
      filterPartsByVehicleAndQuery(parts, {
        make: selectedMake,
        model: selectedModel,
        year: selectedYear,
        category: selectedPartCategory,
        district: selectedPartDistrict,
        searchQuery: partSearchQuery,
      }),
    [
      parts,
      selectedMake,
      selectedModel,
      selectedYear,
      selectedPartCategory,
      selectedPartDistrict,
      partSearchQuery,
    ]
  );

  // Filtered Mechanics
  const filteredMechanics = useMemo(
    () =>
      filterMechanics(mechanics, {
        specialty: selectedSpecialty,
        district: selectedMechanicDistrict,
        minRating: minMechanicRating,
        mobileOnly: mobileDispatchOnly,
        vehicleMake: selectedMake,
        searchQuery: mechanicSearchQuery,
      }),
    [
      mechanics,
      selectedSpecialty,
      selectedMechanicDistrict,
      minMechanicRating,
      mobileDispatchOnly,
      selectedMake,
      mechanicSearchQuery,
    ]
  );

  const selectedVehicleLabel = useMemo(() => {
    const tokens = [selectedYear, selectedMake, selectedModel].filter(Boolean);
    return tokens.length > 0 ? tokens.join(' ') : '';
  }, [selectedMake, selectedModel, selectedYear]);

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Handlers
  const handleSelectMake = (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear('');
  };

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
  };

  const handleApplyVehiclePreset = (make: string, model: string, year: string) => {
    setSelectedMake(make);
    setSelectedModel(model);
    setSelectedYear(year);
  };

  const handleResetVehicle = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setSelectedPartCategory('All');
    setSelectedPartDistrict('All Locations');
    setPartSearchQuery('');
  };

  const handleAddToCart = (part: AutoPart, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.part.id === part.id);
      if (existing) {
        return prev.map((item) =>
          item.part.id === part.id
            ? { ...item, quantity: Math.min(part.stockCount, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { part, quantity }];
    });
    setBannerNotice(`Added ${quantity}x "${part.name}" to your Parts Cart.`);
  };

  const handleUpdateCartQuantity = (partId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.part.id === partId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (partId: string) => {
    setCart((prev) => prev.filter((item) => item.part.id !== partId));
  };

  const handlePlacePartOrder = (newOrder: PartOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setBannerNotice(
      `Order ${newOrder.id} confirmed for ${newOrder.deliveryDistrict}. Total: ${formatSLE(newOrder.totalSLE)}.`
    );
  };

  const handleConfirmBooking = (newBooking: ServiceBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setMechanics((prev) =>
      prev.map((m) =>
        m.id === newBooking.mechanicId
          ? { ...m, completedJobsCount: m.completedJobsCount + 1 }
          : m
      )
    );
    setBookingMechanic(null);
    setBannerNotice(
      `Repair appointment ${newBooking.id} scheduled with ${newBooking.mechanicName} on ${newBooking.preferredDate} at ${newBooking.timeSlot}.`
    );
  };

  const handleUpdateMechanicFromReview = (updated: MechanicProfile) => {
    setMechanics((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setReviewingMechanic(updated);
  };

  const handleRegisterNewMechanic = (newMechanic: MechanicProfile) => {
    setMechanics((prev) => [newMechanic, ...prev]);
    setSelectedSpecialty('All');
    setSelectedMechanicDistrict('All Locations');
    setBannerNotice(
      `Registered ${newMechanic.fullName} (${newMechanic.workshopName}) in the Certified Mechanics Directory.`
    );
    const el = document.getElementById('mechanics');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: 'parts' | 'mechanics' | 'standards') => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFindMechanicForPart = (part: AutoPart) => {
    setInspectedPart(null);
    setSelectedSpecialty(part.recommendedSpecialty);
    const el = document.getElementById('mechanics');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900">
      {/* Top Navigation (Strict 3-Zone Contract) */}
      <TopNav
        cartCount={totalCartItems}
        bookingsCount={bookings.length + orders.length}
        onNavigateSection={handleNavigateSection}
        onOpenRegisterMechanic={() => setIsRegisterMechanicOpen(true)}
        onOpenDrawer={(tab) => {
          setDrawerTab(tab);
          setDrawerOpen(true);
        }}
      />

      {/* Action Confirmation Strip (if active) */}
      {bannerNotice && (
        <div
          role="status"
          className="bg-zinc-800 text-zinc-100 border-b border-zinc-700 px-6 py-2.5 text-xs flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDrawerTab('bookings');
                setDrawerOpen(true);
              }}
              className="text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              View Bookings & Cart
            </button>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* HERO SECTION + VEHICLE FITMENT COMMAND MODULE */}
        <section className="bg-zinc-900 text-zinc-100 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Column: Editorial Headline + Fitment Machine Bar */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <span>SIERRA LEONE AUTOMOTIVE PARTS & REPAIR NETWORK</span>
                    <span aria-hidden="true">·</span>
                    <span>FREETOWN · BO · KENEMA · MAKENI</span>
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white leading-[1.12]"
                    style={{ textWrap: 'balance' }}
                  >
                    Genuine Spare Parts & Certified Mechanics Built for Sierra Leone Roads.
                  </h1>

                  <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                    Filter heavy-duty OEM spare parts by your exact vehicle Make, Model, and
                    Year—then book certified master mechanics for Electrical Systems, Engine
                    Diagnostics, or Transmission Repair with transparent SLE rates.
                  </p>
                </div>

                {/* Vehicle Fitment Selector Machine Box */}
                <div className="p-5 bg-zinc-800 border border-zinc-700 rounded-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      <Wrench className="w-4 h-4" />
                      <span>Filter Parts & Mechanics by Vehicle Make, Model & Year</span>
                    </div>
                    {selectedVehicleLabel && (
                      <button
                        type="button"
                        onClick={handleResetVehicle}
                        className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300 hover:text-amber-400 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Vehicle ({selectedVehicleLabel})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Make Selector */}
                    <div>
                      <label
                        htmlFor="hero-make-select"
                        className="block text-[11px] font-mono text-zinc-300 mb-1"
                      >
                        01. VEHICLE MAKE
                      </label>
                      <select
                        id="hero-make-select"
                        value={selectedMake}
                        onChange={(e) => handleSelectMake(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-zinc-900 border border-zinc-600 rounded-md text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">All Makes</option>
                        {availableMakes.map((make) => (
                          <option key={make} value={make}>
                            {make}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Selector */}
                    <div>
                      <label
                        htmlFor="hero-model-select"
                        className="block text-[11px] font-mono text-zinc-300 mb-1"
                      >
                        02. VEHICLE MODEL
                      </label>
                      <select
                        id="hero-model-select"
                        value={selectedModel}
                        disabled={!selectedMake}
                        onChange={(e) => handleSelectModel(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-zinc-900 border border-zinc-600 rounded-md text-white disabled:opacity-50 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">All Models</option>
                        {availableModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Selector */}
                    <div>
                      <label
                        htmlFor="hero-year-select"
                        className="block text-[11px] font-mono text-zinc-300 mb-1"
                      >
                        03. MODEL YEAR
                      </label>
                      <select
                        id="hero-year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-mono bg-zinc-900 border border-zinc-600 rounded-md text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">All Years</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={String(yr)}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action CTA */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleNavigateSection('parts')}
                        className="w-full py-2.5 px-4 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Show Matched ({filteredParts.length})
                      </button>
                    </div>
                  </div>

                  {/* Quick Common Sierra Leone Vehicle Fitment Presets */}
                  <div className="pt-2 border-t border-zinc-700 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-400">Popular in Salone:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyVehiclePreset('Toyota', 'Hilux 4x4', '2019')
                      }
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                    >
                      2019 Toyota Hilux 4x4
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyVehiclePreset(
                          'Toyota',
                          'Land Cruiser Prado',
                          '2020'
                        )
                      }
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                    >
                      2020 Land Cruiser Prado
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyVehiclePreset('Hyundai', 'Tucson', '2018')
                      }
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                    >
                      2018 Hyundai Tucson
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyVehiclePreset(
                          'Mercedes-Benz',
                          'C-Class (W205)',
                          '2017'
                        )
                      }
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                    >
                      2017 Mercedes C-Class
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Documentary Freetown Workshop Visual */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
                <div className="relative h-64 sm:h-80 lg:h-full w-full bg-zinc-950">
                  <Image
                    src="/images/hero_salone_workshop_1794322110330.jpg"
                    alt="Certified master mechanic performing digital engine diagnostics on a 4x4 pickup in Freetown, Sierra Leone"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white">
                      Freetown Kissy & Lumley Diagnostic Bays
                    </div>
                    <div className="text-zinc-400">
                      SL-ARA Certified Technicians · Printed OBD-II Scan Reports
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigateSection('mechanics')}
                    className="px-3 py-2 text-xs font-semibold text-amber-400 border border-amber-500/50 rounded hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Hire a Mechanic
                  </button>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Operational Proof Bar Below Hero Split */}
            <div className="mt-8 pt-8 border-t border-zinc-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold font-mono text-amber-500 tabular-nums">
                  100% OEM & HD
                </div>
                <div className="text-xs text-zinc-300 mt-1">
                  Serial-verified alternators, injectors, brakes & suspension kits
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  6 Districts
                </div>
                <div className="text-xs text-zinc-300 mt-1">
                  Same-day dispatch in Freetown; highway courier to Bo, Kenema & Makeni
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  3-Pillar Rating
                </div>
                <div className="text-xs text-zinc-300 mt-1">
                  Mechanics scored on Diagnostics, Workmanship & Fair Pricing
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-amber-500 tabular-nums">
                  SLE 160 – 300
                </div>
                <div className="text-xs text-zinc-300 mt-1">
                  Standard upfront OBD-II & mechanical bay diagnostic tariffs
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: SPARE PARTS CATALOG */}
        <section id="parts" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-14 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-300 pb-6">
            <div>
              <div className="text-xs font-mono text-zinc-600">
                01. VERIFIED SPARE PARTS INVENTORY
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 mt-1">
                Heavy-Duty & OEM Replacement Parts
              </h2>
            </div>

            {/* Search & District Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  aria-label="Search spare parts by name or OEM number"
                  value={partSearchQuery}
                  onChange={(e) => setPartSearchQuery(e.target.value)}
                  placeholder="Search part or OEM #..."
                  className="pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600 w-56"
                />
              </div>

              <select
                aria-label="Filter parts by Sierra Leone district"
                value={selectedPartDistrict}
                onChange={(e) =>
                  setSelectedPartDistrict(e.target.value as SierraLeoneDistrict)
                }
                className="px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {SIERRA_LEONE_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive System Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Filter spare parts by vehicle system"
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-200 rounded-md"
            >
              {PART_CATEGORIES.map((cat) => {
                const active = selectedPartCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedPartCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-zinc-900 text-amber-400 shadow-xs'
                        : 'text-zinc-700 hover:text-zinc-950'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-zinc-600">
              Showing <strong>{filteredParts.length}</strong> of {parts.length} parts
              {selectedVehicleLabel ? ` compatible with ${selectedVehicleLabel}` : ''}
            </div>
          </div>

          {/* Parts Grid (3-Column Desktop) */}
          {filteredParts.length === 0 ? (
            <div className="p-12 bg-white border border-zinc-300 rounded-lg text-center space-y-3">
              <div className="text-base font-bold text-zinc-900 font-display">
                No Spare Parts Matched Your Exact Filter Criteria
              </div>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Try clearing the vehicle year or switching the system category tab to browse all
                heavy-duty parts stocked across Sierra Leone.
              </p>
              <button
                type="button"
                onClick={handleResetVehicle}
                className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
              >
                Reset All Part Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParts.map((part) => {
                const fitmentStatus = checkPartCompatibility(part, {
                  make: selectedMake,
                  model: selectedModel,
                  year: selectedYear,
                });

                return (
                  <article
                    key={part.id}
                    className="bg-white border border-zinc-300 rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Product Image on Solid Dark Steel Backdrop */}
                      <div className="relative aspect-[4/3] w-full bg-zinc-900 border-b border-zinc-200 overflow-hidden">
                        <Image
                          src={part.imageUrl}
                          alt={part.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>

                      {/* Card Body (Zero-Pill Clean Metadata) */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 font-mono">
                          <span className="uppercase font-sans font-semibold text-zinc-600">
                            {part.brand}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>OEM {part.oemPartNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span>{part.condition}</span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-900 font-display leading-snug">
                          {part.name}
                        </h3>

                        {/* Vehicle Fitment Line */}
                        <div className="text-xs text-zinc-600 flex items-start gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>
                            {fitmentStatus === 'exact_fit' && selectedVehicleLabel ? (
                              <strong className="text-emerald-800">
                                Direct Fit for {selectedVehicleLabel}
                              </strong>
                            ) : part.isUniversalFit ? (
                              'Universal 12V Fitment (SUVs, Pickups & Sedans)'
                            ) : (
                              `Fits: ${part.compatibleVehicles
                                .slice(0, 2)
                                .map((v) => `${v.make} ${v.model} (${v.yearStart}–${v.yearEnd})`)
                                .join(', ')}`
                            )}
                          </span>
                        </div>

                        {/* Stock & District Line */}
                        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {part.district} · {part.stockCount} in stock · {part.warrantyMonths}mo
                            warranty
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-zinc-500">Unit Price</div>
                        <div className="text-lg font-bold font-mono text-zinc-900 tabular-nums">
                          {formatSLE(part.priceSLE)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedPart(part)}
                          className="px-3 py-2 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Specs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(part, 1)}
                          className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: CERTIFIED MECHANICS & SERVICE SCHEDULING */}
        <section
          id="mechanics"
          className="scroll-mt-20 bg-white border-t border-b border-zinc-300 py-14"
        >
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
              <div>
                <div className="text-xs font-mono text-amber-700 font-semibold">
                  02. HIRE CERTIFIED MASTER MECHANICS & SCHEDULE REPAIRS
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 mt-1">
                  Verified Automotive Specialists & Workshop Bays
                </h2>
                <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                  Select a system specialty—Electrical Systems, Engine Diagnostics, Transmission
                  Repair, or 4x4 Suspension—inspect verified trade certifications and customer
                  ratings, and schedule your repair directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRegisterMechanicOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Create Mechanic Profile</span>
                </button>
              </div>
            </div>

            {/* Specialty Filter Tabs + District / Rating / Roadside Controls */}
            <div className="space-y-4">
              <div
                role="tablist"
                aria-label="Filter mechanics by technical specialty"
                className="flex flex-wrap items-center gap-2"
              >
                {MECHANIC_SPECIALTIES.map(({ label, icon: Icon }) => {
                  const active = selectedSpecialty === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedSpecialty(label)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-zinc-900 text-amber-400 border-zinc-900'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Filter Bar */}
              <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-md flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      aria-label="Search mechanics by name, certification, or workshop"
                      value={mechanicSearchQuery}
                      onChange={(e) => setMechanicSearchQuery(e.target.value)}
                      placeholder="Search mechanic or certification..."
                      className="pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded text-zinc-900 w-56"
                    />
                  </div>

                  <select
                    aria-label="Filter mechanics by Sierra Leone district"
                    value={selectedMechanicDistrict}
                    onChange={(e) =>
                      setSelectedMechanicDistrict(
                        e.target.value as SierraLeoneDistrict
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded text-zinc-900"
                  >
                    {SIERRA_LEONE_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Minimum mechanic rating filter"
                    value={minMechanicRating}
                    onChange={(e) => setMinMechanicRating(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars Only</option>
                    <option value={4.8}>4.8+ Stars Only</option>
                  </select>

                  <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileDispatchOnly}
                      onChange={(e) => setMobileDispatchOnly(e.target.checked)}
                      className="rounded border-zinc-400 text-amber-600"
                    />
                    <span>Mobile Roadside Dispatch Available</span>
                  </label>
                </div>

                <div className="text-xs font-mono text-zinc-600">
                  <strong>{filteredMechanics.length}</strong> Certified Workshops Available
                </div>
              </div>
            </div>

            {/* Mechanics Directory Grid */}
            {filteredMechanics.length === 0 ? (
              <div className="p-12 bg-zinc-50 border border-zinc-200 rounded-lg text-center space-y-3">
                <div className="text-base font-bold text-zinc-900 font-display">
                  No Mechanics Matched Your Current Filter
                </div>
                <p className="text-xs text-zinc-600 max-w-md mx-auto">
                  Reset the specialty or district filter to view all certified mechanics across
                  Freetown, Bo, Kenema, and Makeni.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty('All');
                    setSelectedMechanicDistrict('All Locations');
                    setMobileDispatchOnly(false);
                    setMinMechanicRating(0);
                    setMechanicSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md cursor-pointer"
                >
                  Show All Mechanics
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMechanics.map((mech) => {
                  const ratingSummary = calculateMechanicRatingSummary(mech.reviews);

                  return (
                    <article
                      key={mech.id}
                      className="bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        {/* Top Unboxed Metadata Row */}
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-zinc-600">
                          <span className="font-semibold text-amber-700 font-sans">
                            {mech.primarySpecialty}
                          </span>
                          <span>{mech.yearsExperience} Yrs Exp · {mech.completedJobsCount} Jobs</span>
                        </div>

                        {/* Name & Workshop */}
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 font-display">
                            {mech.fullName}
                          </h3>
                          <div className="text-xs font-semibold text-zinc-700 mt-0.5">
                            {mech.workshopName}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{mech.addressDetail}</span>
                          </div>
                        </div>

                        {/* Robust Multi-Metric Rating Box */}
                        <div className="p-3 bg-white border border-zinc-200 rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-bold font-mono text-zinc-900 tabular-nums">
                                {ratingSummary.overallAverage.toFixed(1)}
                              </span>
                              <span className="text-xs text-zinc-500">
                                ({ratingSummary.totalReviews} verified reviews)
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                              SL-ARA Verified
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-zinc-100 text-[11px] font-mono text-zinc-600">
                            <div>
                              Diag: <strong className="text-zinc-900">{ratingSummary.diagnosticsAverage.toFixed(1)}</strong>
                            </div>
                            <div>
                              Work: <strong className="text-zinc-900">{ratingSummary.workmanshipAverage.toFixed(1)}</strong>
                            </div>
                            <div>
                              Price: <strong className="text-zinc-900">{ratingSummary.pricingAverage.toFixed(1)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Secondary Specialties & Certifications */}
                        <div className="space-y-2 text-xs">
                          <div className="text-zinc-600">
                            <strong className="text-zinc-900">Systems:</strong>{' '}
                            {[mech.primarySpecialty, ...mech.secondarySpecialties].join(' · ')}
                          </div>

                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              Certifications & Tooling:
                            </div>
                            {mech.certifications.slice(0, 2).map((cert, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-zinc-700">
                                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{cert}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-zinc-600 pt-1">
                            <strong className="text-zinc-900">Availability:</strong>{' '}
                            <span className="font-mono">{mech.availableDays.join(', ')}</span>
                            {' · '}
                            <span>
                              {mech.mobileRoadsideAvailable
                                ? 'Workshop & Mobile Roadside'
                                : 'Workshop Bay Only'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer with Rates & Actions */}
                      <div className="px-6 py-4 bg-zinc-100 border-t border-zinc-200 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600">OBD-II & Bay Diagnostic Fee:</span>
                          <span className="text-base font-bold font-mono text-zinc-900 tabular-nums">
                            {formatSLE(mech.diagnosticFeeSLE)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewingMechanic(mech)}
                            className="px-3 py-2 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-200 border border-zinc-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Reviews & Rate ({ratingSummary.totalReviews})
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingMechanic(mech)}
                            className="px-3 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Book Service
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: SIERRA LEONE FLEET PROOF & SERVICE STANDARDS */}
        <section id="standards" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-14 space-y-8">
          <div className="max-w-2xl">
            <div className="text-xs font-mono text-zinc-600">
              03. SALONE WORKMANSHIP & FITMENT GUARANTEE
            </div>
            <h2 className="text-2xl font-bold font-display text-zinc-900 mt-1">
              Engineered for Accountability Across Every Repair Bay
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-zinc-300 rounded-lg space-y-2">
              <div className="text-sm font-bold text-zinc-900 font-display">
                01. Exact Make, Model & Year Fitment
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every alternator, fuel injector, clutch kit, and brake rotor is cross-referenced
                by OEM serial number for Toyota, Nissan, Mitsubishi, Hyundai, Honda, and
                Mercedes-Benz models operating in Sierra Leone.
              </p>
            </div>

            <div className="p-6 bg-white border border-zinc-300 rounded-lg space-y-2">
              <div className="text-sm font-bold text-zinc-900 font-display">
                02. Certified System Specialists
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Mechanics list their verified SL-ARA and Bosch credentials alongside specific
                system specialties—so electrical harness faults go to auto-electricians and
                gearbox rebuilds go to transmission specialists.
              </p>
            </div>

            <div className="p-6 bg-white border border-zinc-300 rounded-lg space-y-2">
              <div className="text-sm font-bold text-zinc-900 font-display">
                03. Transparent 3-Pillar Ratings
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every completed service booking allows vehicle owners to score Diagnostic
                Accuracy, Mechanical Workmanship, and Fair SLE Pricing—preventing trial-and-error
                parts swapping.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Industrial Footer */}
      <footer className="bg-zinc-900 text-zinc-400 border-t border-zinc-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="space-y-1">
            <div className="text-base font-bold text-amber-500 font-display">
              SaloneAutoHub
            </div>
            <p className="text-zinc-400">
              Sierra Leone Automotive Spare Parts & Certified Mechanics Marketplace · Freetown,
              Bo, Kenema & Makeni.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#parts" className="hover:text-white transition-colors">
              Spare Parts Catalog
            </a>
            <a href="#mechanics" className="hover:text-white transition-colors">
              Certified Mechanics
            </a>
            <button
              type="button"
              onClick={() => setIsRegisterMechanicOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Register Workshop
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <PartDetailModal
        part={inspectedPart}
        selectedVehicleLabel={selectedVehicleLabel}
        onClose={() => setInspectedPart(null)}
        onAddToCart={handleAddToCart}
        onFindMechanicForPart={handleFindMechanicForPart}
      />

      <MechanicBookingModal
        mechanic={bookingMechanic}
        defaultVehicle={{
          make: selectedMake,
          model: selectedModel,
          year: selectedYear,
        }}
        onClose={() => setBookingMechanic(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      <MechanicReviewModal
        mechanic={reviewingMechanic}
        onClose={() => setReviewingMechanic(null)}
        onUpdateMechanic={handleUpdateMechanicFromReview}
        onOpenBookingFromReview={(mech) => setBookingMechanic(mech)}
      />

      <RegisterMechanicModal
        isOpen={isRegisterMechanicOpen}
        onClose={() => setIsRegisterMechanicOpen(false)}
        onRegisterMechanic={handleRegisterNewMechanic}
      />

      <CartAndOrdersDrawer
        isOpen={drawerOpen}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlacePartOrder={handlePlacePartOrder}
        bookings={bookings}
        orders={orders}
      />
    </div>
  );
}
