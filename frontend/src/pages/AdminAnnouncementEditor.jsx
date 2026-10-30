// frontend/src/pages/AdminAnnouncementEditor.jsx
import ContentEditorPage from "../components/ContentEditorPage";

export default function AdminAnnouncementEditor() {
  return (
    <ContentEditorPage
      pageTitle="New Announcement"
      editTitle="Edit Announcement"
      apiBase="/admin/announcements"
      routeBase="/announcements"
      uploadFolder="halesi-books/announcements"
      showWebsiteUrl
      allowDocuments
      contentLabel="Full Details"
      contentPlaceholder="Write the full announcement, eligibility, deadlines..."
    />
  );
}