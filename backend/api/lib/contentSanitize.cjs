// backend/api/lib/contentSanitize.cjs
const sanitizeHtml = require("sanitize-html");
const OPTS = {
  allowedTags: ["p","br","strong","em","u","s","h1","h2","h3","ul","ol","li","blockquote","code","pre","a","hr","img","table","thead","tbody","tr","th","td"],
  allowedAttributes: {
    a: ["href","target","rel"],
    img: ["src","alt","width","height"],
    table: ["border","cellpadding","cellspacing"],
  },
  allowedSchemes: ["http","https","mailto","tel"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};
function cleanHtml(html) {
  if (!html) return "";
  return sanitizeHtml(String(html), OPTS);
}
module.exports = { cleanHtml };
