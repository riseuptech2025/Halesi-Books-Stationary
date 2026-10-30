// backend/api/admin/materials/index.cjs
const { buildAdminListHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminListHandler("materials", {
  allowDocuments: true,
});