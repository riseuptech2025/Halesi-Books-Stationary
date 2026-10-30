// backend/api/admin/announcements/index.cjs
const { buildAdminListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminListHandler("announcements", {
  allowWebsiteUrl: true,
  allowDocuments: true,
});