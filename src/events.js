export const Pt = {
  TECHNICAL: "Technical",
  NON_TECHNICAL: "Non-Technical"
};

export const ut = {
  PENDING: "Payment Pending Verification",
  REVIEW: "Under Review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  PRESENT: "Checked In"
};

export const lp = "2026-09-03T09:00:00";

// Dynamic events list (events are fetched directly from Supabase DB / Admin Hub)
export const Sr = [];

/**
 * Calculates pricing details for ADAGE'26 event registration.
 * 
 * Base Registration Pass:
 * - Base pass is ₹350 flat per participant (covers up to 2 Technical + up to 2 Non-Technical events).
 * - Additional events beyond 2 Tech or 2 Non-Tech are charged at extra event rates (+₹200 Tech, +₹150 Non-Tech).
 */
export function calculatePricing(techCount, nonTechCount, totalParticipants = 1) {
  const techBaseFee = 200;
  const nonTechBaseFee = 150;
  const bundleFee = 350;
  const totalEvents = techCount + nonTechCount;

  if (totalEvents === 0) {
    return {
      techCount: 0,
      nonTechCount: 0,
      totalEvents: 0,
      techBaseFee,
      nonTechBaseFee,
      bundleFee,
      techInBundle: 0,
      nonTechInBundle: 0,
      bundleEventsCount: 0,
      extraTechCount: 0,
      extraNonTechCount: 0,
      normalTotal: 0,
      discount: 0,
      baseRate: 0,
      isBundleApplied: false,
      totalParticipants: totalParticipants || 1,
      totalPayableFee: 0
    };
  }

  // Base bundle is ₹350 covering up to 2 Tech + 2 Non-Tech
  const extraTechCount = Math.max(0, techCount - 2);
  const extraNonTechCount = Math.max(0, nonTechCount - 2);
  const baseRate = bundleFee + (extraTechCount * techBaseFee) + (extraNonTechCount * nonTechBaseFee);

  // Standard catalog sum for comparative display
  const standardValue = (techCount * techBaseFee) + (nonTechCount * nonTechBaseFee);
  const discount = Math.max(0, standardValue - baseRate);
  const totalPayableFee = (totalParticipants || 1) * baseRate;

  const techInBundle = Math.min(techCount, 2);
  const nonTechInBundle = Math.min(nonTechCount, 2);
  const bundleEventsCount = techInBundle + nonTechInBundle;

  return {
    techCount,
    nonTechCount,
    totalEvents,
    techBaseFee,
    nonTechBaseFee,
    bundleFee,
    techInBundle,
    nonTechInBundle,
    bundleEventsCount,
    extraTechCount,
    extraNonTechCount,
    normalTotal: standardValue,
    discount,
    baseRate,
    isBundleApplied: true,
    totalParticipants: totalParticipants || 1,
    totalPayableFee
  };
}
