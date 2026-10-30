// backend/api/public/announcements/[id].cjs
const { buildPublicDetailHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildPublicDetailHandler("announcements");