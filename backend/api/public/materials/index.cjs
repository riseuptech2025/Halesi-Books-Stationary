// backend/api/public/materials/index.cjs
const { buildPublicListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildPublicListHandler("materials", {
  allowDocuments: true,
});