// frontend/src/pages/AdminAnnouncements.jsx
import ContentAdminPage from "../components/ContentAdminPage";
export default function AdminAnnouncements() {
  return (
    <ContentAdminPage
      title="Announcements"
      subtitle="Post job notices and official announcements."
      apiBase="/admin/announcements"
      routeBase="/announcements"
      showWebsiteUrl
    />
  );
}