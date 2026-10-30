// backend/api/public/announcements/index.cjs
const { buildPublicListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildPublicListHandler("announcements", {
  allowWebsiteUrl: true,
  allowDocuments: true,
});