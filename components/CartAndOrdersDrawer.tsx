'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Calendar,
  CheckCircle2,
  Truck,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import {
  CartItem,
  ServiceBooking,
  PartOrder,
  SierraLeoneDistrict,
  calculateCartTotals,
  formatSLE,
} from '@/lib/marketplace-logic';
import { SIERRA_LEONE_DISTRICTS } from '@/lib/seed-data';

interface CartAndOrdersDrawerProps {
  isOpen: boolean;
  activeTab: 'cart' | 'bookings';
  onTabChange: (tab: 'cart' | 'bookings') => void;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (partId: string, delta: number) => void;
  onRemoveItem: (partId: string) => void;
  onPlacePartOrder: (order: PartOrder) => void;
  bookings: ServiceBooking[];
  orders: PartOrder[];
}

export default function CartAndOrdersDrawer({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlacePartOrder,
  bookings,
  orders,
}: CartAndOrdersDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+232 ');
  const [deliveryDistrict, setDeliveryDistrict] = useState<
    Exclude<SierraLeoneDistrict, 'All Locations'>
  >('Freetown (Kissy / Wellington)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Orange Money SL' | 'Afrimoney SL' | 'Cash on Delivery (Freetown/Bo)'
  >('Orange Money SL');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totals = calculateCartTotals(cart, deliveryDistrict);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError('Your spare parts cart is empty.');
      return;
    }
    if (!customerName.trim()) {
      setCheckoutError('Please enter your full name for delivery verification.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setCheckoutError('Please enter a valid Sierra Leone phone number (+232).');
      return;
    }
    if (!deliveryAddress.trim()) {
      setCheckoutError('Please enter your delivery street or garage landmark.');
      return;
    }

    const newOrder: PartOrder = {
      id: `ORD-SL-${8401 + orders.length}`,
      items: cart.map((c) => ({
        partId: c.part.id,
        partName: c.part.name,
        oemNumber: c.part.oemPartNumber,
        quantity: c.quantity,
        unitPriceSLE: c.part.priceSLE,
      })),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryDistrict,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      subtotalSLE: totals.subtotalSLE,
      deliveryFeeSLE: totals.deliveryFeeSLE,
      totalSLE: totals.totalSLE,
      status: 'Confirmed — Dispatching',
      createdAt: 'Just now',
    };

    onPlacePartOrder(newOrder);
    setCustomerName('');
    setDeliveryAddress('');
    onTabChange('bookings');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Parts Cart and Scheduled Bookings"
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/75"
    >
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col border-l border-zinc-300 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange('cart')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Parts Cart ({totals.totalItemsCount})
            </button>
            <button
              type="button"
              onClick={() => onTabChange('bookings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Bookings & Orders ({bookings.length + orders.length})
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {activeTab === 'cart' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto" />
                <div className="text-base font-bold text-zinc-900 font-display">
                  Your Spare Parts Cart is Empty
                </div>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Filter the catalog by your vehicle Make, Model, and Year to add verified OEM parts.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.part.id}
                      className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-zinc-500">
                          OEM: {item.part.oemPartNumber}
                        </div>
                        <div className="text-sm font-bold text-zinc-900">
                          {item.part.name}
                        </div>
                        <div className="text-xs font-mono font-semibold text-zinc-800">
                          {formatSLE(item.part.priceSLE)} each
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center border border-zinc-300 rounded bg-white">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.part.name}`}
                            onClick={() => onUpdateQuantity(item.part.id, -1)}
                            className="px-2 py-1 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 text-xs font-mono font-semibold text-zinc-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.part.name}`}
                            onClick={() => onUpdateQuantity(item.part.id, 1)}
                            className="px-2 py-1 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.part.id)}
                          className="text-[11px] text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <form
                  onSubmit={handleCheckout}
                  className="pt-4 border-t border-zinc-200 space-y-4"
                >
                  <h4 className="text-sm font-bold text-zinc-900 font-display">
                    Dispatch & Payment Verification (Sierra Leone)
                  </h4>

                  {checkoutError && (
                    <div
                      role="alert"
                      className="p-3 bg-red-50 border border-red-300 rounded-md flex items-center gap-2 text-xs text-red-800"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="cart-customer-name"
                      className="block text-xs font-semibold text-zinc-700 mb-1"
                    >
                      Recipient or Mechanic Name
                    </label>
                    <input
                      id="cart-customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Santigie Koroma"
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cart-customer-phone"
                      className="block text-xs font-semibold text-zinc-700 mb-1"
                    >
                      Phone Number (+232)
                    </label>
                    <input
                      id="cart-customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+232 76 000 000"
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cart-district"
                      className="block text-xs font-semibold text-zinc-700 mb-1"
                    >
                      Delivery District
                    </label>
                    <select
                      id="cart-district"
                      value={deliveryDistrict}
                      onChange={(e) =>
                        setDeliveryDistrict(
                          e.target.value as Exclude<SierraLeoneDistrict, 'All Locations'>
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900"
                    >
                      {SIERRA_LEONE_DISTRICTS.filter((d) => d !== 'All Locations').map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cart-address"
                      className="block text-xs font-semibold text-zinc-700 mb-1"
                    >
                      Street Address or Workshop Drop-Off Landmark
                    </label>
                    <input
                      id="cart-address"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 142 Kissy Road or Lumley Roundabout Garage"
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cart-payment"
                      className="block text-xs font-semibold text-zinc-700 mb-1"
                    >
                      Payment Method
                    </label>
                    <select
                      id="cart-payment"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900"
                    >
                      <option value="Orange Money SL">Orange Money SL (#144#)</option>
                      <option value="Afrimoney SL">Afrimoney SL (*161#)</option>
                      <option value="Cash on Delivery (Freetown/Bo)">
                        Cash on Delivery (Verify Part on Arrival)
                      </option>
                    </select>
                  </div>

                  {/* Totals Summary */}
                  <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-md space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Parts Subtotal</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        {formatSLE(totals.subtotalSLE)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Dispatch Fee ({deliveryDistrict})</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        {totals.deliveryFeeSLE === 0
                          ? 'FREE (Over SLE 4,000)'
                          : formatSLE(totals.deliveryFeeSLE)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-zinc-300 flex justify-between text-sm font-bold text-zinc-900">
                      <span>Total Due</span>
                      <span className="font-mono">{formatSLE(totals.totalSLE)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
                  >
                    Confirm Spare Parts Order · {formatSLE(totals.totalSLE)}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Scheduled Mechanic Bookings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Scheduled Mechanic Appointments ({bookings.length})
              </h4>
              {bookings.length === 0 ? (
                <p className="text-xs text-zinc-500">No repair appointments scheduled yet.</p>
              ) : (
                bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 bg-zinc-50 border border-zinc-200 rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-900">{bk.id}</span>
                      <span className="text-emerald-700 font-semibold">{bk.status}</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-900">
                      {bk.mechanicName} — {bk.workshopName}
                    </div>
                    <div className="text-xs text-zinc-600">
                      Vehicle: <strong>{bk.vehicleYear} {bk.vehicleMake} {bk.vehicleModel}</strong> · System: {bk.specialtyBooked}
                    </div>
                    <div className="text-xs text-zinc-600 font-mono">
                      {bk.preferredDate} at {bk.timeSlot} · {bk.serviceMode} · Diagnostic: {formatSLE(bk.estimatedDiagnosticSLE)}
                    </div>
                    <p className="text-xs text-zinc-500 italic">“{bk.issueDescription}”</p>
                  </div>
                ))
              )}
            </div>

            {/* Spare Part Orders */}
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Confirmed Spare Part Dispatches ({orders.length})
              </h4>
              {orders.length === 0 ? (
                <p className="text-xs text-zinc-500">No part orders placed yet in this session.</p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-zinc-50 border border-zinc-200 rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-900">{ord.id}</span>
                      <span className="text-emerald-700 font-semibold">{ord.status}</span>
                    </div>
                    <div className="text-xs text-zinc-700 space-y-1">
                      {ord.items.map((it) => (
                        <div key={it.partId} className="flex justify-between font-mono">
                          <span>
                            {it.quantity}x {it.partName}
                          </span>
                          <span>{formatSLE(it.unitPriceSLE * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between text-xs font-mono font-bold text-zinc-900">
                      <span>{ord.paymentMethod}</span>
                      <span>Total: {formatSLE(ord.totalSLE)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
