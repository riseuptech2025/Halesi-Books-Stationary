const { buildAdminListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminListHandler("announcements", { allowWebsiteUrl: true });
