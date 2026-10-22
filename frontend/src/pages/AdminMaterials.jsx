// frontend/src/pages/AdminMaterials.jsx
import ContentAdminPage from "../components/ContentAdminPage";
export default function AdminMaterials() {
  return (
    <ContentAdminPage
      title="Study Materials"
      subtitle="Publish notes and study guides for students."
      apiBase="/admin/materials"
      routeBase="/materials"
    />
  );
}