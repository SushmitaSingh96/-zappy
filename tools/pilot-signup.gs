/**
 * Zappy founding household reservations → Google Sheet, cat photos → Google Drive.
 *
 * Setup (about 5 minutes):
 * 1. Create a new Google Sheet, e.g. "Zappy reservations".
 * 2. In the sheet: Extensions → Apps Script. Delete what's there and paste this whole file. Save.
 * 3. Deploy → New deployment → gear icon → Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, approve the permissions, and copy the Web app URL.
 * 4. Paste that URL into SIGNUP_URL in script.js.
 *
 * Every reservation becomes a row in the "Signups" tab. Cat photos go into a private
 * Drive folder called "Zappy cat photos", and the row links to the photo.
 * Download it any time with File → Download → CSV.
 */

const SHEET_NAME = "Signups";
const PHOTO_FOLDER_NAME = "Zappy cat photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const FIELDS = ["first_name", "last_name", "email", "cat_name", "location", "sitter_ok", "would_pay", "consent"];

function doPost(e) {
  const p = e.parameter || {};

  // Bots fill in the hidden "website" field; real visitors never see it.
  if (p.website) return ok();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || "")) return ok();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(["submitted_at"].concat(FIELDS, "photo"));
    sheet.appendRow([new Date()].concat(FIELDS.map((f) => clean(p[f])), savePhoto(p.photo)));
  } finally {
    lock.releaseLock();
  }
  return ok();
}

// A photo that can't be saved must never cost us the reservation itself.
function savePhoto(base64) {
  if (!base64) return "";
  try {
    const bytes = Utilities.base64Decode(base64);
    if (bytes.length > MAX_PHOTO_BYTES) return "photo too large";
    const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME);
    const name = "cat-" + new Date().toISOString().replace(/[:.]/g, "-") + ".jpg";
    return folder.createFile(Utilities.newBlob(bytes, "image/jpeg", name)).getUrl();
  } catch (err) {
    return "photo failed: " + err.message;
  }
}

// Stops values like "=HYPERLINK(...)" from running as formulas when the sheet is opened.
function clean(value) {
  const text = String(value || "").slice(0, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function ok() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
