// frontend/src/pages/AdminMaterialEditor.jsx
import ContentEditorPage from "../components/ContentEditorPage";

export default function AdminMaterialEditor() {
  return (
    <ContentEditorPage
      pageTitle="New Study Material"
      editTitle="Edit Study Material"
      apiBase="/admin/materials"
      routeBase="/materials"
      uploadFolder="halesi-books/materials"
      allowDocuments
      contentLabel="Study Notes"
      contentPlaceholder="Write the study notes here..."
    />
  );
}