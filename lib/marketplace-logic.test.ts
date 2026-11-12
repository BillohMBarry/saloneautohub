import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkPartCompatibility,
  filterPartsByVehicleAndQuery,
  calculateMechanicRatingSummary,
  filterMechanics,
  addReviewToMechanic,
  validateMechanicProfileInput,
  validateBookingInput,
  calculateCartTotals,
} from './marketplace-logic';
import { INITIAL_PARTS, INITIAL_MECHANICS } from './seed-data';

test('checkPartCompatibility filters accurately by make, model, and year range', () => {
  const hiluxAlternator = INITIAL_PARTS[0]; // Fits Toyota Hilux 4x4 2015-2024

  assert.equal(
    checkPartCompatibility(hiluxAlternator, {
      make: 'Toyota',
      model: 'Hilux 4x4',
      year: '2019',
    }),
    'exact_fit'
  );

  assert.equal(
    checkPartCompatibility(hiluxAlternator, {
      make: 'Toyota',
      model: 'Hilux 4x4',
      year: '2011',
    }),
    'incompatible'
  );

  assert.equal(
    checkPartCompatibility(hiluxAlternator, {
      make: 'Honda',
      model: 'CR-V',
      year: '2019',
    }),
    'incompatible'
  );

  // Universal battery fits any vehicle
  const universalBattery = INITIAL_PARTS[7];
  assert.equal(
    checkPartCompatibility(universalBattery, {
      make: 'Honda',
      model: 'CR-V',
      year: '2020',
    }),
    'universal_fit'
  );
});

test('filterPartsByVehicleAndQuery returns matching vehicle parts and respects category filter', () => {
  const hilux2019Parts = filterPartsByVehicleAndQuery(INITIAL_PARTS, {
    make: 'Toyota',
    model: 'Hilux 4x4',
    year: '2019',
    category: 'All',
    district: 'All Locations',
    searchQuery: '',
  });

  // Should include Hilux compatible parts + universal battery
  assert.ok(hilux2019Parts.length >= 5);
  assert.ok(hilux2019Parts.some((p) => p.id === 'part-101'));
  assert.ok(!hilux2019Parts.some((p) => p.id === 'part-106')); // ZF kit is for Mercedes/Nissan/Honda/Hyundai

  const electricalOnly = filterPartsByVehicleAndQuery(INITIAL_PARTS, {
    make: 'Toyota',
    model: 'Hilux 4x4',
    year: '2019',
    category: 'Electrical Systems',
    district: 'All Locations',
    searchQuery: '',
  });

  assert.equal(electricalOnly.length, 2); // Alternator + AGM Battery
});

test('filterMechanics filters by specialty, district, and roadside availability', () => {
  const electricalMechs = filterMechanics(INITIAL_MECHANICS, {
    specialty: 'Electrical Systems',
    district: 'All Locations',
    minRating: 0,
    mobileOnly: false,
    vehicleMake: '',
    searchQuery: '',
  });

  assert.ok(electricalMechs.length >= 3);
  assert.ok(electricalMechs.some((m) => m.id === 'mech-01'));

  const transmissionFreetown = filterMechanics(INITIAL_MECHANICS, {
    specialty: 'Transmission Repair',
    district: 'Freetown (Kissy / Wellington)',
    minRating: 4.5,
    mobileOnly: false,
    vehicleMake: 'Toyota',
    searchQuery: '',
  });

  assert.equal(transmissionFreetown.length, 1);
  assert.equal(transmissionFreetown[0].id, 'mech-03');
});

test('calculateMechanicRatingSummary and addReviewToMechanic update rating scores properly', () => {
  const mech = INITIAL_MECHANICS[0];
  const initialSummary = calculateMechanicRatingSummary(mech.reviews);
  assert.equal(initialSummary.totalReviews, 2);
  assert.equal(initialSummary.overallAverage, 4.9);

  const result = addReviewToMechanic(mech, {
    reviewerName: 'Alpha Sesay',
    vehicleServiced: '2021 Toyota Hilux 4x4',
    servicePerformed: 'ECU Reprogramming',
    workmanshipRating: 5,
    diagnosticsRating: 5,
    pricingRating: 5,
    comment: 'Superb diagnostic accuracy and fast turnaround in Kissy.',
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    const newSummary = calculateMechanicRatingSummary(result.updatedMechanic.reviews);
    assert.equal(newSummary.totalReviews, 3);
    assert.equal(newSummary.overallAverage, 4.9);
    assert.equal(newSummary.starCounts[5], 3);
  }
});

test('validateMechanicProfileInput and validateBookingInput reject empty fields', () => {
  const invalidMechanic = validateMechanicProfileInput({
    fullName: '',
    workshopName: 'Test Garage',
    primarySpecialty: 'Electrical Systems',
    secondarySpecialties: [],
    district: 'Freetown (Kissy / Wellington)',
    addressDetail: '10 Kissy Rd',
    phone: '+23276111222',
    yearsExperience: 5,
    certificationsText: 'SL-ARA Certified',
    diagnosticFeeSLE: 200,
    hourlyLaborSLE: 250,
    mobileRoadsideAvailable: true,
    availableDays: ['Mon'],
    vehicleBrandsServiced: ['Toyota'],
    bio: 'Experienced tech',
  });
  assert.equal(invalidMechanic.ok, false);

  const validBooking = validateBookingInput({
    customerName: 'Mariatu Kamara',
    customerPhone: '+232 76 123 456',
    vehicleMake: 'Toyota',
    vehicleModel: 'RAV4',
    vehicleYear: '2018',
    serviceMode: 'Workshop Drop-Off',
    preferredDate: '2026-11-15',
    timeSlot: '09:00 AM',
    issueDescription: 'Check engine light on and rough idle when AC is turned on.',
  });
  assert.equal(validBooking.ok, true);
});

test('calculateCartTotals computes Freetown free shipping threshold and provincial rates', () => {
  const singleBatteryCart = [{ part: INITIAL_PARTS[7], quantity: 1 }]; // SLE 2150
  const freetownUnderThreshold = calculateCartTotals(
    singleBatteryCart,
    'Freetown (Kissy / Wellington)'
  );
  assert.equal(freetownUnderThreshold.subtotalSLE, 2150);
  assert.equal(freetownUnderThreshold.deliveryFeeSLE, 85);
  assert.equal(freetownUnderThreshold.totalSLE, 2235);

  const twoBatteriesCart = [{ part: INITIAL_PARTS[7], quantity: 2 }]; // SLE 4300 >= 4000
  const freetownFreeDelivery = calculateCartTotals(
    twoBatteriesCart,
    'Freetown (Kissy / Wellington)'
  );
  assert.equal(freetownFreeDelivery.deliveryFeeSLE, 0);
  assert.equal(freetownFreeDelivery.totalSLE, 4300);

  const boDelivery = calculateCartTotals(singleBatteryCart, 'Bo (Bo-Kenema Highway)');
  assert.equal(boDelivery.deliveryFeeSLE, 220);
  assert.equal(boDelivery.totalSLE, 2370);
});
