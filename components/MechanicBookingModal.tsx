'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Wrench, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  MechanicProfile,
  ServiceBooking,
  validateBookingInput,
  formatSLE,
  calculateMechanicRatingSummary,
} from '@/lib/marketplace-logic';
import { VEHICLE_CATALOG } from '@/lib/seed-data';

interface MechanicBookingModalProps {
  mechanic: MechanicProfile | null;
  defaultVehicle: { make: string; model: string; year: string };
  onClose: () => void;
  onConfirmBooking: (booking: ServiceBooking) => void;
}

export default function MechanicBookingModal({
  mechanic,
  defaultVehicle,
  onClose,
  onConfirmBooking,
}: MechanicBookingModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+232 ');
  const [vehicleMake, setVehicleMake] = useState(defaultVehicle.make || 'Toyota');
  const [vehicleModel, setVehicleModel] = useState(
    defaultVehicle.model || 'Hilux 4x4'
  );
  const [vehicleYear, setVehicleYear] = useState(defaultVehicle.year || '2019');
  const [specialtyBooked, setSpecialtyBooked] = useState<string>(
    mechanic?.primarySpecialty || 'Electrical Systems'
  );
  const [serviceMode, setServiceMode] = useState<
    'Workshop Drop-Off' | 'Mobile Roadside Dispatch'
  >('Workshop Drop-Off');
  const [preferredDate, setPreferredDate] = useState('2026-11-14');
  const [timeSlot, setTimeSlot] = useState(
    mechanic?.availableTimeSlots[0] || '09:00 AM'
  );
  const [issueDescription, setIssueDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!mechanic) return null;

  const ratingSummary = calculateMechanicRatingSummary(mechanic.reviews);
  const availableModels = VEHICLE_CATALOG[vehicleMake]
    ? Object.keys(VEHICLE_CATALOG[vehicleMake])
    : ['Hilux 4x4'];
  const allMechanicSpecialties = [
    mechanic.primarySpecialty,
    ...mechanic.secondarySpecialties,
  ];

  const handleMakeChange = (newMake: string) => {
    setVehicleMake(newMake);
    const models = VEHICLE_CATALOG[newMake]
      ? Object.keys(VEHICLE_CATALOG[newMake])
      : [];
    const firstModel = models[0] || '';
    setVehicleModel(firstModel);
    const years =
      firstModel && VEHICLE_CATALOG[newMake]?.[firstModel]
        ? VEHICLE_CATALOG[newMake][firstModel]
        : [2020];
    setVehicleYear(String(years[0] || 2020));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateBookingInput({
      customerName,
      customerPhone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      serviceMode,
      preferredDate,
      timeSlot,
      issueDescription,
    });

    if (!validation.ok) {
      setErrorMsg(validation.error);
      return;
    }

    const newBooking: ServiceBooking = {
      id: `BK-SL-${8042 + mechanic.completedJobsCount}`,
      mechanicId: mechanic.id,
      mechanicName: mechanic.fullName,
      workshopName: mechanic.workshopName,
      specialtyBooked,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      vehicleMake,
      vehicleModel,
      vehicleYear,
      serviceMode,
      preferredDate,
      timeSlot,
      issueDescription: issueDescription.trim(),
      estimatedDiagnosticSLE:
        serviceMode === 'Mobile Roadside Dispatch'
          ? mechanic.diagnosticFeeSLE + 120
          : mechanic.diagnosticFeeSLE,
      status: 'Confirmed',
      createdAt: 'Just now',
    };

    onConfirmBooking(newBooking);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80"
    >
      <div className="relative w-full max-w-2xl bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-zinc-100 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-amber-400">
              DIRECT WORKSHOP SCHEDULING · {mechanic.district.toUpperCase()}
            </p>
            <h3 id="booking-modal-title" className="text-lg font-bold font-display text-white">
              Schedule Repair with {mechanic.fullName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Workshop Summary Banner */}
          <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-900">
                {mechanic.workshopName}
              </div>
              <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{mechanic.addressDetail}</span>
              </div>
              <div className="text-xs text-zinc-600 font-mono">
                Rating: {ratingSummary.overallAverage} / 5.0 ({ratingSummary.totalReviews} verified reviews) · Available: {mechanic.availableDays.join(', ')}
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-xs text-zinc-500">Standard Diagnostic Fee</div>
              <div className="text-lg font-bold font-mono text-zinc-900 tabular-nums">
                {formatSLE(mechanic.diagnosticFeeSLE)}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-300 rounded-md flex items-center gap-2 text-xs font-medium text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="booking-customer-name"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Your Full Name
              </label>
              <input
                id="booking-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alhaji Musa Sesay"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label
                htmlFor="booking-customer-phone"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Sierra Leone Phone Number (SMS / WhatsApp)
              </label>
              <input
                id="booking-customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+232 76 000 000"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="booking-vehicle-make"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Vehicle Make
              </label>
              <select
                id="booking-vehicle-make"
                value={vehicleMake}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {Object.keys(VEHICLE_CATALOG).map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="booking-vehicle-model"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Vehicle Model
              </label>
              <select
                id="booking-vehicle-model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="booking-vehicle-year"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Model Year
              </label>
              <select
                id="booking-vehicle-year"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map(
                  (yr) => (
                    <option key={yr} value={String(yr)}>
                      {yr}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Specialty & Service Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="booking-specialty"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Required System Specialty
              </label>
              <select
                id="booking-specialty"
                value={specialtyBooked}
                onChange={(e) => setSpecialtyBooked(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {allMechanicSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Service Location Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceMode('Workshop Drop-Off')}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    serviceMode === 'Workshop Drop-Off'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  Workshop Bay
                </button>
                <button
                  type="button"
                  disabled={!mechanic.mobileRoadsideAvailable}
                  onClick={() => setServiceMode('Mobile Roadside Dispatch')}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    serviceMode === 'Mobile Roadside Dispatch'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : mechanic.mobileRoadsideAvailable
                      ? 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  {mechanic.mobileRoadsideAvailable ? 'Mobile Dispatch (+SLE 120)' : 'Workshop Only'}
                </button>
              </div>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="booking-date"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Preferred Appointment Date
              </label>
              <input
                id="booking-date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Available Workshop Time Slots
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mechanic.availableTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      timeSlot === slot
                        ? 'bg-amber-500 text-zinc-950 border-amber-600'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fault Description */}
          <div>
            <label
              htmlFor="booking-issue-desc"
              className="block text-xs font-semibold text-zinc-700 mb-1.5"
            >
              Describe Vehicle Fault, Warning Lights, or Part Installation Needed
            </label>
            <textarea
              id="booking-issue-desc"
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g. Battery warning light stays on, need OBD-II scan and Denso alternator installation..."
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-600">
              <span>Estimated Diagnostic & Bay Reservation: </span>
              <strong className="font-mono text-sm text-zinc-900">
                {formatSLE(
                  serviceMode === 'Mobile Roadside Dispatch'
                    ? mechanic.diagnosticFeeSLE + 120
                    : mechanic.diagnosticFeeSLE
                )}
              </strong>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Confirm Repair Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
