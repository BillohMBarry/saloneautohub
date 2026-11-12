'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  MapPin,
  Phone,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import {
  MechanicProfile,
  calculateMechanicRatingSummary,
  addReviewToMechanic,
  formatSLE,
} from '@/lib/marketplace-logic';

interface MechanicReviewModalProps {
  mechanic: MechanicProfile | null;
  onClose: () => void;
  onUpdateMechanic: (updated: MechanicProfile) => void;
  onOpenBookingFromReview: (mechanic: MechanicProfile) => void;
}

export default function MechanicReviewModal({
  mechanic,
  onClose,
  onUpdateMechanic,
  onOpenBookingFromReview,
}: MechanicReviewModalProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [vehicleServiced, setVehicleServiced] = useState('');
  const [servicePerformed, setServicePerformed] = useState('');
  const [workmanshipRating, setWorkmanshipRating] = useState(5);
  const [diagnosticsRating, setDiagnosticsRating] = useState(5);
  const [pricingRating, setPricingRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!mechanic) return null;

  const summary = calculateMechanicRatingSummary(mechanic.reviews);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = addReviewToMechanic(mechanic, {
      reviewerName,
      vehicleServiced,
      servicePerformed,
      workmanshipRating,
      diagnosticsRating,
      pricingRating,
      comment,
    });

    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    onUpdateMechanic(res.updatedMechanic);
    setReviewerName('');
    setVehicleServiced('');
    setServicePerformed('');
    setComment('');
    setWorkmanshipRating(5);
    setDiagnosticsRating(5);
    setPricingRating(5);
    setSuccessMsg('Your verified quality rating has been recorded and added to the mechanic profile.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mechanic-review-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80"
    >
      <div className="relative w-full max-w-4xl bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-zinc-100 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-amber-400">
              CERTIFIED CREDENTIALS & QUALITY RATING LEDGER
            </p>
            <h3 id="mechanic-review-title" className="text-lg font-bold font-display text-white">
              {mechanic.fullName} — {mechanic.workshopName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close credentials and reviews modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: Credentials, Rating Breakdown & Write Review Form */}
          <div className="lg:col-span-5 p-6 bg-zinc-100 border-b lg:border-b-0 lg:border-r border-zinc-200 space-y-6">
            {/* Overall Score Block */}
            <div className="p-4 bg-white border border-zinc-200 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 tabular-nums">
                    {summary.overallAverage.toFixed(1)}
                    <span className="text-base font-normal text-zinc-500"> / 5.0</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Based on {summary.totalReviews} Verified Repairs
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(summary.overallAverage)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-zinc-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 3-Pillar Technical Breakdown */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Diagnostic Accuracy</span>
                  <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                    {summary.diagnosticsAverage.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(summary.diagnosticsAverage / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-600">Mechanical Workmanship</span>
                  <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                    {summary.workmanshipAverage.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(summary.workmanshipAverage / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-600">Fair & Transparent Pricing</span>
                  <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                    {summary.pricingAverage.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(summary.pricingAverage / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Verified Certifications */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Verified Trade Certifications
              </h4>
              <ul className="space-y-2 text-xs text-zinc-800">
                {mechanic.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Workshop Details */}
            <div className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-200">
              <div>
                <strong className="text-zinc-900">Primary Specialty:</strong> {mechanic.primarySpecialty}
              </div>
              <div>
                <strong className="text-zinc-900">Additional Systems:</strong>{' '}
                {mechanic.secondarySpecialties.join(' · ')}
              </div>
              <div>
                <strong className="text-zinc-900">Address:</strong> {mechanic.addressDetail}
              </div>
              <div className="font-mono">
                <strong className="text-zinc-900 font-sans">Standard Rates:</strong> Diagnostic{' '}
                {formatSLE(mechanic.diagnosticFeeSLE)} · Labor {formatSLE(mechanic.hourlyLaborSLE)}/hr
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookingFromReview(mechanic);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>Schedule Repair Appointment</span>
            </button>
          </div>

          {/* Right Column: Verified Reviews List + Submit New Review Form */}
          <div className="lg:col-span-7 p-6 bg-white space-y-6">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 font-display mb-3">
                Verified Customer Service Reports ({mechanic.reviews.length})
              </h4>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {mechanic.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-zinc-50 border border-zinc-200 rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-zinc-900">
                        {rev.reviewerName}
                        <span className="font-normal text-zinc-500">
                          {' '}
                          · {rev.vehicleServiced} · {rev.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{rev.overallRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-zinc-700">
                      Job: {rev.servicePerformed}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-500">
                      <span>Diagnostics: {rev.diagnosticsRating}/5</span>
                      <span aria-hidden="true">·</span>
                      <span>Workmanship: {rev.workmanshipRating}/5</span>
                      <span aria-hidden="true">·</span>
                      <span>Fair Pricing: {rev.pricingRating}/5</span>
                      {rev.verifiedBooking && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-sans font-medium">
                            Verified SaloneAutoHub Job
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit New Multi-Criteria Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="pt-5 border-t border-zinc-200 space-y-4"
            >
              <h4 className="text-sm font-bold text-zinc-900 font-display">
                Rate {mechanic.fullName}’s Service Quality
              </h4>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-300 rounded-md flex items-center gap-2 text-xs text-red-800"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="p-3 bg-emerald-50 border border-emerald-300 rounded-md flex items-center gap-2 text-xs text-emerald-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="rev-customer-name"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="rev-customer-name"
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Ibrahim Bangura"
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rev-vehicle"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Vehicle Serviced
                  </label>
                  <input
                    id="rev-vehicle"
                    type="text"
                    value={vehicleServiced}
                    onChange={(e) => setVehicleServiced(e.target.value)}
                    placeholder="e.g. 2019 Toyota Hilux 4x4"
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rev-service"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Repair or Diagnostic Service Performed
                </label>
                <input
                  id="rev-service"
                  type="text"
                  value={servicePerformed}
                  onChange={(e) => setServicePerformed(e.target.value)}
                  placeholder="e.g. Alternator installation & ECU fault code clearing"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* 3 Pillar Star Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                <div>
                  <label
                    htmlFor="rev-diag-score"
                    className="block text-[11px] font-semibold text-zinc-700 mb-1"
                  >
                    Diagnostics (1–5)
                  </label>
                  <select
                    id="rev-diag-score"
                    value={diagnosticsRating}
                    onChange={(e) => setDiagnosticsRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rev-work-score"
                    className="block text-[11px] font-semibold text-zinc-700 mb-1"
                  >
                    Workmanship (1–5)
                  </label>
                  <select
                    id="rev-work-score"
                    value={workmanshipRating}
                    onChange={(e) => setWorkmanshipRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rev-price-score"
                    className="block text-[11px] font-semibold text-zinc-700 mb-1"
                  >
                    Fair Pricing (1–5)
                  </label>
                  <select
                    id="rev-price-score"
                    value={pricingRating}
                    onChange={(e) => setPricingRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rev-comment"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Review Details
                </label>
                <textarea
                  id="rev-comment"
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how accurately the mechanic diagnosed the problem and whether pricing was transparent..."
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                >
                  Submit Verified Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
