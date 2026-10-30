// backend/api/public/materials/[id].cjs
const { buildPublicDetailHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildPublicDetailHandler("materials");