'use client';

import React, { useState } from 'react';
import { X, Wrench, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  MechanicProfile,
  MechanicSpecialty,
  SierraLeoneDistrict,
  validateMechanicProfileInput,
} from '@/lib/marketplace-logic';
import { SIERRA_LEONE_DISTRICTS, VEHICLE_CATALOG } from '@/lib/seed-data';

interface RegisterMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterMechanic: (newMechanic: MechanicProfile) => void;
}

const SPECIALTIES: Exclude<MechanicSpecialty, 'All'>[] = [
  'Electrical Systems',
  'Engine Diagnostics',
  'Transmission Repair',
  'Brakes & 4x4 Suspension',
  'AC & Cooling Systems',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RegisterMechanicModal({
  isOpen,
  onClose,
  onRegisterMechanic,
}: RegisterMechanicModalProps) {
  const [fullName, setFullName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [primarySpecialty, setPrimarySpecialty] = useState<Exclude<MechanicSpecialty, 'All'>>(
    'Electrical Systems'
  );
  const [secondarySpecialties, setSecondarySpecialties] = useState<
    Exclude<MechanicSpecialty, 'All'>[]
  >(['Engine Diagnostics']);
  const [district, setDistrict] = useState<Exclude<SierraLeoneDistrict, 'All Locations'>>(
    'Freetown (Kissy / Wellington)'
  );
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('+232 ');
  const [yearsExperience, setYearsExperience] = useState(8);
  const [certificationsText, setCertificationsText] = useState(
    'SL-ARA Certified Technician, OBD-II Systems Specialist'
  );
  const [diagnosticFeeSLE, setDiagnosticFeeSLE] = useState(220);
  const [hourlyLaborSLE, setHourlyLaborSLE] = useState(280);
  const [mobileRoadsideAvailable, setMobileRoadsideAvailable] = useState(true);
  const [availableDays, setAvailableDays] = useState<string[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  const [vehicleBrandsServiced, setVehicleBrandsServiced] = useState<string[]>([
    'Toyota',
    'Nissan',
    'Mitsubishi',
  ]);
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSecondarySpecialty = (spec: Exclude<MechanicSpecialty, 'All'>) => {
    if (spec === primarySpecialty) return;
    setSecondarySpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleBrand = (brand: string) => {
    setVehicleBrandsServiced((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateMechanicProfileInput({
      fullName,
      workshopName,
      primarySpecialty,
      secondarySpecialties,
      district,
      addressDetail,
      phone,
      yearsExperience,
      certificationsText,
      diagnosticFeeSLE,
      hourlyLaborSLE,
      mobileRoadsideAvailable,
      availableDays,
      vehicleBrandsServiced,
      bio,
    });

    if (!validation.ok) {
      setErrorMsg(validation.error);
      return;
    }

    const parsedCertifications = certificationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newMechanic: MechanicProfile = {
      id: `mech-${Date.now()}`,
      fullName: fullName.trim(),
      workshopName: workshopName.trim(),
      primarySpecialty,
      secondarySpecialties: secondarySpecialties.filter((s) => s !== primarySpecialty),
      district,
      addressDetail: addressDetail.trim(),
      phone: phone.trim(),
      yearsExperience: Number(yearsExperience) || 5,
      certifications: parsedCertifications,
      diagnosticFeeSLE: Number(diagnosticFeeSLE),
      hourlyLaborSLE: Number(hourlyLaborSLE) || 250,
      mobileRoadsideAvailable,
      availableDays,
      availableTimeSlots: ['08:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
      completedJobsCount: 1,
      vehicleBrandsServiced,
      bio:
        bio.trim() ||
        `Certified ${primarySpecialty} specialist serving ${district} with transparent diagnostic testing and quality repairs.`,
      reviews: [
        {
          id: `rev-init-${Date.now()}`,
          reviewerName: 'SaloneAutoHub Verification Team',
          vehicleServiced: `${vehicleBrandsServiced[0] || 'Toyota'} Fleet Inspection`,
          servicePerformed: 'Workshop Credential & Diagnostic Tool Audit',
          date: 'Today',
          workmanshipRating: 5,
          diagnosticsRating: 5,
          pricingRating: 5,
          overallRating: 5.0,
          comment:
            'Verified trade certifications, workshop bay tooling, and standard SLE diagnostic tariff.',
          verifiedBooking: true,
        },
      ],
    };

    onRegisterMechanic(newMechanic);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-mechanic-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80"
    >
      <div className="relative w-full max-w-2xl bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-zinc-100 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-amber-400">
              SIERRA LEONE CERTIFIED MECHANIC NETWORK
            </p>
            <h3 id="register-mechanic-title" className="text-lg font-bold font-display text-white">
              Create Mechanic & Workshop Profile
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mechanic registration modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-300 rounded-md flex items-center gap-2 text-xs font-medium text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-mech-name"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Lead Mechanic Full Name
              </label>
              <input
                id="reg-mech-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Engr. Foday Sankoh"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label
                htmlFor="reg-workshop-name"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Workshop / Garage Name
              </label>
              <input
                id="reg-workshop-name"
                type="text"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                placeholder="e.g. Congo Cross Auto Diagnostics"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-primary-specialty"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Primary Technical Specialty
              </label>
              <select
                id="reg-primary-specialty"
                value={primarySpecialty}
                onChange={(e) =>
                  setPrimarySpecialty(e.target.value as Exclude<MechanicSpecialty, 'All'>)
                }
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-district"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                District / Corridor in Sierra Leone
              </label>
              <select
                id="reg-district"
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value as Exclude<SierraLeoneDistrict, 'All Locations'>)
                }
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              >
                {SIERRA_LEONE_DISTRICTS.filter((d) => d !== 'All Locations').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Specialties */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Additional Repair Specialties Offered
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.filter((s) => s !== primarySpecialty).map((spec) => {
                const active = secondarySpecialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSecondarySpecialty(spec)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Street Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-address"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Workshop Street Address & Landmark
              </label>
              <input
                id="reg-address"
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="e.g. 45 Wilkinson Road, Freetown"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Workshop Contact Number (+232)
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+232 76 000 000"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Certifications & Rates */}
          <div>
            <label
              htmlFor="reg-certs"
              className="block text-xs font-semibold text-zinc-700 mb-1"
            >
              Certifications & Diagnostic Equipment (comma-separated)
            </label>
            <input
              id="reg-certs"
              type="text"
              value={certificationsText}
              onChange={(e) => setCertificationsText(e.target.value)}
              placeholder="e.g. SL-ARA Master Tech, Bosch KTS Scanner Certified, Toyota T-TEP"
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="reg-diag-fee"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Diagnostic Fee (SLE)
              </label>
              <input
                id="reg-diag-fee"
                type="number"
                value={diagnosticFeeSLE}
                onChange={(e) => setDiagnosticFeeSLE(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900"
              />
            </div>
            <div>
              <label
                htmlFor="reg-hourly-fee"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Hourly Labor Rate (SLE)
              </label>
              <input
                id="reg-hourly-fee"
                type="number"
                value={hourlyLaborSLE}
                onChange={(e) => setHourlyLaborSLE(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900"
              />
            </div>
            <div>
              <label
                htmlFor="reg-exp-years"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Years of Experience
              </label>
              <input
                id="reg-exp-years"
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-900"
              />
            </div>
          </div>

          {/* Availability & Brands */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Available Working Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const active = availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded border cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-zinc-950 border-amber-600'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Vehicle Makes Serviced
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(VEHICLE_CATALOG).map((brand) => {
                  const active = vehicleBrandsServiced.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`px-2.5 py-1 text-xs font-medium rounded border cursor-pointer ${
                        active
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-300'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={mobileRoadsideAvailable}
                onChange={(e) => setMobileRoadsideAvailable(e.target.checked)}
                className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Available for Mobile Roadside Breakdown Dispatch</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
              >
                Publish Mechanic Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
