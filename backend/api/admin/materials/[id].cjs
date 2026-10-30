// backend/api/admin/materials/[id].cjs
const { buildAdminDetailHandler } = require("../../lib/contentCrud.cjs");
module.exports = buildAdminDetailHandler("materials", {
  allowDocuments: true,
});