// backend/api/admin/announcements/[id].cjs
const { buildAdminDetailHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminDetailHandler("announcements", {
  allowWebsiteUrl: true,
  allowDocuments: true,
});