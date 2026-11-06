// Loads the Tally reservation form. If Tally's helper script is blocked,
// the form still loads, it just can't resize itself to fit its content.
const TALLY_SCRIPT = "https://tally.so/widgets/embed.js";

function loadTallyForm() {
  if (typeof Tally !== "undefined") {
    Tally.loadEmbeds();
    return;
  }
  document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((frame) => {
    frame.src = frame.dataset.tallySrc;
  });
}

const tallyScript = document.createElement("script");
tallyScript.src = TALLY_SCRIPT;
tallyScript.onload = loadTallyForm;
tallyScript.onerror = loadTallyForm;
document.body.appendChild(tallyScript);
