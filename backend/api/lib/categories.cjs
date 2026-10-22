// backend/api/lib/categories.cjs
const CATEGORIES = [
  { id: "nijamati",        label: "Nijamati" },
  { id: "public-agency",   label: "Public Agency" },
  { id: "security-agency", label: "Security Agency" },
  { id: "teacher-service", label: "Teacher Service Commission" },
];
const VALID_CATEGORY_IDS = CATEGORIES.map((c) => c.id);
module.exports = { CATEGORIES, VALID_CATEGORY_IDS };
