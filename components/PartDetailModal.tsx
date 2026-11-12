'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Wrench,
  MapPin,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { AutoPart, formatSLE } from '@/lib/marketplace-logic';

interface PartDetailModalProps {
  part: AutoPart | null;
  selectedVehicleLabel: string;
  onClose: () => void;
  onAddToCart: (part: AutoPart, quantity: number) => void;
  onFindMechanicForPart: (part: AutoPart) => void;
}

export default function PartDetailModal({
  part,
  selectedVehicleLabel,
  onClose,
  onAddToCart,
  onFindMechanicForPart,
}: PartDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!part) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="part-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80"
    >
      <div className="relative w-full max-w-4xl bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-zinc-100 border-b border-zinc-800">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span>OEM REF: {part.oemPartNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{part.category}</span>
            <span aria-hidden="true">·</span>
            <span>{part.condition}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close part details"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contiguous Purchase Module Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left: Product Image & Technical Spec Table */}
          <div className="lg:col-span-6 p-6 bg-zinc-100 border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between gap-6">
            <div className="relative aspect-[4/3] w-full bg-zinc-900 rounded-md overflow-hidden border border-zinc-300">
              <Image
                src={part.imageUrl}
                alt={part.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Mechanical & Bench Specifications
              </h4>
              <dl className="divide-y divide-zinc-200 border-t border-b border-zinc-200 text-sm">
                {Object.entries(part.specs).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex items-center justify-between gap-4">
                    <dt className="text-zinc-600 font-medium">{key}</dt>
                    <dd className="text-zinc-900 font-mono text-xs text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between gap-6 bg-white">
            <div className="space-y-4">
              <div className="text-xs text-zinc-600 font-medium">
                <span>{part.brand}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">
                  {part.stockCount} Units Ready in {part.district}
                </span>
              </div>

              <h3
                id="part-detail-title"
                className="text-2xl font-bold text-zinc-900 font-display leading-snug"
              >
                {part.name}
              </h3>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-bold font-mono text-zinc-900 tabular-nums">
                  {formatSLE(part.priceSLE)}
                </span>
                <span className="text-xs text-zinc-500">
                  Includes {part.warrantyMonths}-Month Sierra Leone Supplier Warranty
                </span>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {part.description}
              </p>

              {/* Vehicle Fitment Verification Box */}
              <div className="p-3.5 bg-zinc-100 border border-zinc-200 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {selectedVehicleLabel
                      ? `Verified Fitment for ${selectedVehicleLabel}`
                      : 'Verified Vehicle Compatibility Matrix'}
                  </span>
                </div>
                {part.isUniversalFit ? (
                  <p className="text-xs text-zinc-600">
                    Universal heavy-duty fitment across 12V SUVs, 4x4 pickups, commercial vans, and sedans.
                  </p>
                ) : (
                  <div className="text-xs text-zinc-600 font-mono space-y-1">
                    {part.compatibleVehicles.map((v, idx) => (
                      <div key={idx}>
                        • {v.make} {v.model} ({v.yearStart}–{v.yearEnd})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supplier & Dispatch Info */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Dispatched from: <strong className="text-zinc-900">{part.supplierName}</strong> ({part.district})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Serial-verified genuine part · Free Freetown delivery on orders over SLE 4,000
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase & Mechanic Pairing Actions */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-300 rounded-md bg-zinc-50">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-sm font-mono font-bold text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-mono font-semibold text-zinc-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(part.stockCount, q + 1))}
                    className="px-3 py-2 text-sm font-mono font-bold text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(part, quantity);
                    onClose();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart · {formatSLE(part.priceSLE * quantity)}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onFindMechanicForPart(part);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Filter Certified {part.recommendedSpecialty} Mechanics for Installation
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
