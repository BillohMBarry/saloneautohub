export type PartCategory =
  | 'All'
  | 'Electrical Systems'
  | 'Engine Diagnostics & Fuel'
  | 'Transmission & Clutch'
  | 'Brakes & 4x4 Suspension'
  | 'Cooling & AC Systems';

export type MechanicSpecialty =
  | 'All'
  | 'Electrical Systems'
  | 'Engine Diagnostics'
  | 'Transmission Repair'
  | 'Brakes & 4x4 Suspension'
  | 'AC & Cooling Systems';

export type SierraLeoneDistrict =
  | 'All Locations'
  | 'Freetown (Kissy / Wellington)'
  | 'Freetown (Lumley / Aberdeen)'
  | 'Bo (Bo-Kenema Highway)'
  | 'Kenema (Hangha Road)'
  | 'Makeni (Azzolini Highway)'
  | 'Koidu (Kono District)';

export interface VehicleCompatibility {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
}

export interface AutoPart {
  id: string;
  name: string;
  oemPartNumber: string;
  category: Exclude<PartCategory, 'All'>;
  brand: string;
  condition: 'New OEM' | 'Heavy-Duty Aftermarket' | 'Certified Reconditioned';
  priceSLE: number;
  stockCount: number;
  district: Exclude<SierraLeoneDistrict, 'All Locations'>;
  supplierName: string;
  warrantyMonths: number;
  isUniversalFit?: boolean;
  compatibleVehicles: VehicleCompatibility[];
  specs: Record<string, string>;
  description: string;
  imageUrl: string;
  recommendedSpecialty: Exclude<MechanicSpecialty, 'All'>;
}

export interface MechanicReview {
  id: string;
  reviewerName: string;
  vehicleServiced: string;
  servicePerformed: string;
  date: string;
  workmanshipRating: number; // 1-5
  diagnosticsRating: number; // 1-5
  pricingRating: number; // 1-5
  overallRating: number; // 1-5
  comment: string;
  verifiedBooking: boolean;
}

export interface MechanicProfile {
  id: string;
  fullName: string;
  workshopName: string;
  primarySpecialty: Exclude<MechanicSpecialty, 'All'>;
  secondarySpecialties: Exclude<MechanicSpecialty, 'All'>[];
  district: Exclude<SierraLeoneDistrict, 'All Locations'>;
  addressDetail: string;
  phone: string;
  yearsExperience: number;
  certifications: string[];
  diagnosticFeeSLE: number;
  hourlyLaborSLE: number;
  mobileRoadsideAvailable: boolean;
  availableDays: string[];
  availableTimeSlots: string[];
  completedJobsCount: number;
  vehicleBrandsServiced: string[];
  bio: string;
  reviews: MechanicReview[];
}

export interface VehicleFilterState {
  make: string; // '' for Any Make
  model: string; // '' for Any Model
  year: string; // '' for Any Year
  category: PartCategory;
  district: SierraLeoneDistrict;
  searchQuery: string;
}

export interface MechanicFilterState {
  specialty: MechanicSpecialty;
  district: SierraLeoneDistrict;
  minRating: number;
  mobileOnly: boolean;
  vehicleMake: string;
  searchQuery: string;
}

export interface CartItem {
  part: AutoPart;
  quantity: number;
}

export interface ServiceBooking {
  id: string;
  mechanicId: string;
  mechanicName: string;
  workshopName: string;
  specialtyBooked: string;
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceMode: 'Workshop Drop-Off' | 'Mobile Roadside Dispatch';
  preferredDate: string;
  timeSlot: string;
  issueDescription: string;
  estimatedDiagnosticSLE: number;
  status: 'Confirmed' | 'In Bay' | 'Completed';
  createdAt: string;
}

export interface PartOrder {
  id: string;
  items: { partId: string; partName: string; oemNumber: string; quantity: number; unitPriceSLE: number }[];
  customerName: string;
  customerPhone: string;
  deliveryDistrict: Exclude<SierraLeoneDistrict, 'All Locations'>;
  deliveryAddress: string;
  paymentMethod: 'Orange Money SL' | 'Afrimoney SL' | 'Cash on Delivery (Freetown/Bo)';
  subtotalSLE: number;
  deliveryFeeSLE: number;
  totalSLE: number;
  status: 'Confirmed — Dispatching' | 'Delivered';
  createdAt: string;
}

export type FitmentCheckResult =
  | 'exact_fit'
  | 'universal_fit'
  | 'incompatible'
  | 'no_vehicle_selected';

/**
 * Checks if a given auto part fits the selected Make, Model, and Year.
 */
export function checkPartCompatibility(
  part: AutoPart,
  selected: { make: string; model: string; year: string }
): FitmentCheckResult {
  const make = selected.make.trim();
  const model = selected.model.trim();
  const yearNum = selected.year ? parseInt(selected.year, 10) : NaN;

  if (!make && !model && isNaN(yearNum)) {
    return 'no_vehicle_selected';
  }

  if (part.isUniversalFit) {
    return 'universal_fit';
  }

  const matches = part.compatibleVehicles.some((compat) => {
    const makeMatch = !make || compat.make.toLowerCase() === make.toLowerCase();
    const modelMatch = !model || compat.model.toLowerCase() === model.toLowerCase();
    const yearMatch =
      isNaN(yearNum) || (yearNum >= compat.yearStart && yearNum <= compat.yearEnd);
    return makeMatch && modelMatch && yearMatch;
  });

  return matches ? 'exact_fit' : 'incompatible';
}

/**
 * Filters the auto parts catalog by vehicle make, model, year, category, district, and search keyword.
 */
export function filterPartsByVehicleAndQuery(
  parts: AutoPart[],
  filter: VehicleFilterState
): AutoPart[] {
  const query = filter.searchQuery.trim().toLowerCase();

  return parts.filter((part) => {
    if (filter.category !== 'All' && part.category !== filter.category) {
      return false;
    }

    if (
      filter.district !== 'All Locations' &&
      part.district !== filter.district
    ) {
      return false;
    }

    const fitment = checkPartCompatibility(part, {
      make: filter.make,
      model: filter.model,
      year: filter.year,
    });

    if (fitment === 'incompatible') {
      return false;
    }

    if (query) {
      const searchableText = [
        part.name,
        part.oemPartNumber,
        part.brand,
        part.category,
        part.description,
        part.supplierName,
        ...part.compatibleVehicles.map((v) => `${v.make} ${v.model} ${v.yearStart}-${v.yearEnd}`),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export interface MechanicRatingSummary {
  overallAverage: number;
  workmanshipAverage: number;
  diagnosticsAverage: number;
  pricingAverage: number;
  totalReviews: number;
  starCounts: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

/**
 * Calculates comprehensive rating statistics for a mechanic based on verified reviews.
 */
export function calculateMechanicRatingSummary(
  reviews: MechanicReview[]
): MechanicRatingSummary {
  const starCounts: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (reviews.length === 0) {
    return {
      overallAverage: 0,
      workmanshipAverage: 0,
      diagnosticsAverage: 0,
      pricingAverage: 0,
      totalReviews: 0,
      starCounts,
    };
  }

  let sumOverall = 0;
  let sumWorkmanship = 0;
  let sumDiagnostics = 0;
  let sumPricing = 0;

  for (const rev of reviews) {
    sumOverall += rev.overallRating;
    sumWorkmanship += rev.workmanshipRating;
    sumDiagnostics += rev.diagnosticsRating;
    sumPricing += rev.pricingRating;

    const bucket = Math.min(5, Math.max(1, Math.round(rev.overallRating))) as 1 | 2 | 3 | 4 | 5;
    starCounts[bucket] += 1;
  }

  const count = reviews.length;
  const round1 = (n: number) => Math.round(n * 10) / 10;

  return {
    overallAverage: round1(sumOverall / count),
    workmanshipAverage: round1(sumWorkmanship / count),
    diagnosticsAverage: round1(sumDiagnostics / count),
    pricingAverage: round1(sumPricing / count),
    totalReviews: count,
    starCounts,
  };
}

/**
 * Filters certified mechanics by specialty, district, minimum rating, roadside dispatch, vehicle make, and search text.
 */
export function filterMechanics(
  mechanics: MechanicProfile[],
  filter: MechanicFilterState
): MechanicProfile[] {
  const query = filter.searchQuery.trim().toLowerCase();

  return mechanics.filter((mech) => {
    if (filter.specialty !== 'All') {
      const hasSpecialty =
        mech.primarySpecialty === filter.specialty ||
        mech.secondarySpecialties.includes(filter.specialty);
      if (!hasSpecialty) return false;
    }

    if (
      filter.district !== 'All Locations' &&
      mech.district !== filter.district
    ) {
      return false;
    }

    if (filter.mobileOnly && !mech.mobileRoadsideAvailable) {
      return false;
    }

    if (filter.vehicleMake) {
      const servicesMake = mech.vehicleBrandsServiced.some(
        (b) => b.toLowerCase() === filter.vehicleMake.toLowerCase()
      );
      if (!servicesMake) return false;
    }

    const ratingSummary = calculateMechanicRatingSummary(mech.reviews);
    if (filter.minRating > 0 && ratingSummary.overallAverage < filter.minRating) {
      return false;
    }

    if (query) {
      const searchable = [
        mech.fullName,
        mech.workshopName,
        mech.primarySpecialty,
        ...mech.secondarySpecialties,
        ...mech.certifications,
        ...mech.vehicleBrandsServiced,
        mech.district,
        mech.bio,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export interface NewReviewInput {
  reviewerName: string;
  vehicleServiced: string;
  servicePerformed: string;
  workmanshipRating: number;
  diagnosticsRating: number;
  pricingRating: number;
  comment: string;
}

/**
 * Validates and appends a customer review to a mechanic profile.
 */
export function addReviewToMechanic(
  mechanic: MechanicProfile,
  input: NewReviewInput
): { ok: true; updatedMechanic: MechanicProfile; review: MechanicReview } | { ok: false; error: string } {
  if (!input.reviewerName.trim()) {
    return { ok: false, error: 'Please enter your full name.' };
  }
  if (!input.vehicleServiced.trim()) {
    return { ok: false, error: 'Please specify the vehicle make/model serviced.' };
  }
  if (!input.servicePerformed.trim()) {
    return { ok: false, error: 'Please specify the repair or diagnostic service performed.' };
  }
  if (!input.comment.trim() || input.comment.trim().length < 8) {
    return { ok: false, error: 'Please write a brief review describing your service experience (at least 8 characters).' };
  }

  const ratings = [input.workmanshipRating, input.diagnosticsRating, input.pricingRating];
  if (ratings.some((r) => typeof r !== 'number' || r < 1 || r > 5)) {
    return { ok: false, error: 'Ratings must be between 1 and 5 stars.' };
  }

  const overallRating =
    Math.round(((input.workmanshipRating + input.diagnosticsRating + input.pricingRating) / 3) * 10) / 10;

  const newReview: MechanicReview = {
    id: `rev-${Date.now()}`,
    reviewerName: input.reviewerName.trim(),
    vehicleServiced: input.vehicleServiced.trim(),
    servicePerformed: input.servicePerformed.trim(),
    date: 'Just now',
    workmanshipRating: input.workmanshipRating,
    diagnosticsRating: input.diagnosticsRating,
    pricingRating: input.pricingRating,
    overallRating,
    comment: input.comment.trim(),
    verifiedBooking: true,
  };

  const updatedMechanic: MechanicProfile = {
    ...mechanic,
    reviews: [newReview, ...mechanic.reviews],
  };

  return { ok: true, updatedMechanic, review: newReview };
}

export interface NewMechanicRegistrationInput {
  fullName: string;
  workshopName: string;
  primarySpecialty: Exclude<MechanicSpecialty, 'All'>;
  secondarySpecialties: Exclude<MechanicSpecialty, 'All'>[];
  district: Exclude<SierraLeoneDistrict, 'All Locations'>;
  addressDetail: string;
  phone: string;
  yearsExperience: number;
  certificationsText: string;
  diagnosticFeeSLE: number;
  hourlyLaborSLE: number;
  mobileRoadsideAvailable: boolean;
  availableDays: string[];
  vehicleBrandsServiced: string[];
  bio: string;
}

export function validateMechanicProfileInput(
  input: NewMechanicRegistrationInput
): { ok: true } | { ok: false; error: string } {
  if (!input.fullName.trim()) {
    return { ok: false, error: 'Mechanic full name is required.' };
  }
  if (!input.workshopName.trim()) {
    return { ok: false, error: 'Workshop or garage name is required.' };
  }
  if (!input.phone.trim() || input.phone.trim().length < 7) {
    return { ok: false, error: 'Valid Sierra Leone phone number (+232) is required.' };
  }
  if (!input.addressDetail.trim()) {
    return { ok: false, error: 'Workshop street address or landmark is required.' };
  }
  if (!input.certificationsText.trim()) {
    return { ok: false, error: 'Please list at least one trade certification or credential.' };
  }
  if (isNaN(input.diagnosticFeeSLE) || input.diagnosticFeeSLE <= 0) {
    return { ok: false, error: 'Diagnostic fee in SLE must be greater than 0.' };
  }
  if (input.availableDays.length === 0) {
    return { ok: false, error: 'Please select at least one available working day.' };
  }
  if (input.vehicleBrandsServiced.length === 0) {
    return { ok: false, error: 'Please select at least one vehicle brand serviced.' };
  }
  return { ok: true };
}

export interface BookingInput {
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceMode: 'Workshop Drop-Off' | 'Mobile Roadside Dispatch';
  preferredDate: string;
  timeSlot: string;
  issueDescription: string;
}

export function validateBookingInput(
  input: BookingInput
): { ok: true } | { ok: false; error: string } {
  if (!input.customerName.trim()) {
    return { ok: false, error: 'Customer name is required.' };
  }
  if (!input.customerPhone.trim() || input.customerPhone.trim().length < 7) {
    return { ok: false, error: 'Valid phone number (+232) is required for booking confirmation.' };
  }
  if (!input.vehicleMake.trim() || !input.vehicleModel.trim() || !input.vehicleYear.trim()) {
    return { ok: false, error: 'Please provide your vehicle make, model, and year.' };
  }
  if (!input.preferredDate.trim()) {
    return { ok: false, error: 'Please select a service date.' };
  }
  if (!input.timeSlot.trim()) {
    return { ok: false, error: 'Please select an available time slot.' };
  }
  if (!input.issueDescription.trim() || input.issueDescription.trim().length < 6) {
    return { ok: false, error: 'Please describe the fault, symptom, or required repair.' };
  }
  return { ok: true };
}

/**
 * Calculates cart subtotal, district delivery fee in Sierra Leone New Leone (SLE), and final total.
 */
export function calculateCartTotals(
  items: CartItem[],
  deliveryDistrict: Exclude<SierraLeoneDistrict, 'All Locations'>
): { subtotalSLE: number; deliveryFeeSLE: number; totalSLE: number; totalItemsCount: number } {
  const subtotalSLE = items.reduce(
    (sum, item) => sum + item.part.priceSLE * item.quantity,
    0
  );
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (subtotalSLE === 0) {
    return { subtotalSLE: 0, deliveryFeeSLE: 0, totalSLE: 0, totalItemsCount: 0 };
  }

  // Free delivery in Freetown for orders >= SLE 4,000; provincial highway dispatch fee for Bo/Kenema/Makeni/Koidu
  const isFreetown = deliveryDistrict.startsWith('Freetown');
  let deliveryFeeSLE = isFreetown ? 85 : 220;
  if (isFreetown && subtotalSLE >= 4000) {
    deliveryFeeSLE = 0;
  }

  return {
    subtotalSLE,
    deliveryFeeSLE,
    totalSLE: subtotalSLE + deliveryFeeSLE,
    totalItemsCount,
  };
}

/**
 * Formats Sierra Leonean Leone (SLE) currency cleanly with tabular digits.
 */
export function formatSLE(amount: number): string {
  return `SLE ${amount.toLocaleString('en-US')}`;
}
