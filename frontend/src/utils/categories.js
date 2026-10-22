// frontend/src/utils/categories.js
export const CATEGORY_OPTIONS = [
  { id: "nijamati",        label: "Nijamati" },
  { id: "public-agency",   label: "Public Agency" },
  { id: "security-agency", label: "Security Agency" },
  { id: "teacher-service", label: "Teacher Service Commission" },
];

export function categoryLabel(id) {
  return CATEGORY_OPTIONS.find((c) => c.id === id)?.label || id;
}