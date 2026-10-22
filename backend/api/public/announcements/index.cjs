const { buildPublicListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildPublicListHandler("announcements", { allowWebsiteUrl: true });
