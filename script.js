// Reservations post to a Google Apps Script, which adds a row to a Google Sheet
// and saves any cat photo to a private Google Drive folder.
// Paste the web app URL from the setup in tools/pilot-signup.gs here.
const SIGNUP_URL = "";

const MAX_PHOTO_SIZE = 1200;
const CONTACT_EMAIL = "founders@zappy-robotics.com";

const form = document.getElementById("reserve-form");
const statusLine = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');
const thanks = document.getElementById("form-thanks");
const photoInput = document.getElementById("photo-input");
const photoTitle = document.getElementById("photo-title");
const photoTitleDefault = photoTitle.textContent;

let photoData = "";

// Shrinks the photo in the browser so it uploads quickly, whatever its original size.
async function readPhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
}

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  photoData = "";
  statusLine.textContent = "";
  photoTitle.textContent = photoTitleDefault;
  if (!file) return;

  try {
    photoData = await readPhoto(file);
    photoTitle.textContent = file.name;
  } catch {
    photoInput.value = "";
    statusLine.textContent = "We couldn’t read that photo. Please try a JPG or PNG, or send it when we write back.";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  form.classList.add("submitted");
  statusLine.textContent = "";

  if (!form.checkValidity()) {
    statusLine.textContent = "Please fill in the highlighted fields and tick the consent box.";
    form.querySelector(":invalid").focus();
    return;
  }

  if (!SIGNUP_URL) {
    statusLine.textContent = `Online reservations open soon. Until then, please email us at ${CONTACT_EMAIL}.`;
    return;
  }

  const buttonLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  const body = new URLSearchParams(new FormData(form));
  if (photoData) body.set("photo", photoData);

  try {
    // Apps Script doesn't send CORS headers we can rely on, so the response is opaque.
    // A network error still throws, which is the failure we can detect.
    await fetch(SIGNUP_URL, { method: "POST", mode: "no-cors", body });
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  } catch {
    statusLine.textContent = `Something went wrong. Please check your connection and try again, or email us at ${CONTACT_EMAIL}.`;
    submitButton.disabled = false;
    submitButton.textContent = buttonLabel;
  }
});
