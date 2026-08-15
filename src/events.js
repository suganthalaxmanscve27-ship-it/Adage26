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

// Dynamic events list fetched directly from Supabase events table
export const Sr = [];

/**
 * Calculates pricing details for ADAGE'26 event registration.
 * 
 * Tech event base fee = ₹250
 * Non-Tech event base fee = ₹150
 * 1-to-1 Bundle rule: Each 1 Tech event unlocks 1 Non-Tech event for ₹50 (giving a ₹100 discount per paired Non-Tech).
 * Max 2 bundles (1 Tech : 1 Non-Tech @ ₹50, 2 Tech : 2 Non-Tech @ ₹50 each).
 */
export function calculatePricing(techCount, nonTechCount, totalParticipants = 1) {
  const techBaseFee = 250;
  const nonTechBaseFee = 150;

  const normalTotal = (techCount * techBaseFee) + (nonTechCount * nonTechBaseFee);
  const bundleCount = Math.min(techCount, nonTechCount);
  const discount = bundleCount * 100;
  const baseRate = normalTotal - discount;
  const totalPayableFee = (totalParticipants || 1) * baseRate;

  return {
    techCount,
    nonTechCount,
    normalTotal,
    bundleCount,
    discount,
    baseRate,
    totalParticipants: totalParticipants || 1,
    totalPayableFee
  };
}
