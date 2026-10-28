// backend/api/lib/discount.cjs
const { connectToDatabase } = require("./db.cjs");

/**
 * Get currently-active store-wide offers.
 * An offer is active if: active === true AND now between startsAt and endsAt.
 */
async function getActiveOffers(db) {
  const now = new Date();
  const offers = await db
    .collection("offers")
    .find({
      active: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
    .toArray();
  return offers;
}

/**
 * Given a book and the list of active offers, return the best applicable discount.
 * Returns { percent, source, endsAt, offerId, offerName } or null.
 */
function bestDiscountForBook(book, activeOffers) {
  const candidates = [];

  // Per-book discount
  if (book.discountPercent && book.discountPercent > 0) {
    const endsAt = book.discountEndsAt ? new Date(book.discountEndsAt) : null;
    const stillActive = !endsAt || endsAt > new Date();
    if (stillActive) {
      candidates.push({
        percent: Math.min(90, Number(book.discountPercent)),
        source: "book",
        endsAt: endsAt,
        offerId: null,
        offerName: null,
      });
    }
  }

  // Store-wide offers
  for (const offer of activeOffers) {
    // Category filter: empty array (or missing) = all books
    const cats = Array.isArray(offer.categories) ? offer.categories : [];
    if (cats.length > 0 && !cats.includes(book.category)) continue;

    candidates.push({
      percent: Math.min(90, Number(offer.percent) || 0),
      source: "offer",
      endsAt: new Date(offer.endsAt),
      offerId: offer._id.toString(),
      offerName: offer.name || "Offer",
    });
  }

  if (candidates.length === 0) return null;

  // Pick highest percent. On tie, prefer per-book (more specific).
  candidates.sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return a.source === "book" ? -1 : 1;
  });
  return candidates[0];
}

/**
 * Decorate a book doc with computed pricing fields.
 * IMPORTANT: does NOT mutate the stored DB doc — returns a new object.
 */
function applyPricing(book, activeOffers) {
  const basePrice = Number(book.price) || 0;
  const discount = bestDiscountForBook(book, activeOffers);
  const percent = discount ? discount.percent : 0;
  const finalPrice = Math.round(basePrice * (1 - percent / 100) * 100) / 100;

  return {
    ...book,
    originalPrice: basePrice,
    finalPrice,
    discountPercent: percent,
    discountSource: discount?.source || null,
    discountEndsAt: discount?.endsAt || null,
    offerName: discount?.offerName || null,
    hasDiscount: percent > 0,
  };
}

async function withActiveOffers(db, books) {
  const activeOffers = await getActiveOffers(db);
  const list = Array.isArray(books) ? books : [books];
  const out = list.map((b) => applyPricing(b, activeOffers));
  return Array.isArray(books) ? out : out[0];
}

module.exports = {
  getActiveOffers,
  bestDiscountForBook,
  applyPricing,
  withActiveOffers,
};