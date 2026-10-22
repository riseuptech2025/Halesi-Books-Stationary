const { buildAdminDetailHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminDetailHandler("announcements", { allowWebsiteUrl: true });