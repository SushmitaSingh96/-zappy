// Loads the Tally reservation form. If Tally's helper script is blocked,
// the form still loads, it just can't resize itself to fit its content.
const TALLY_SCRIPT = "https://tally.so/widgets/embed.js";

// Tells the form where the visitor came from (?src=reddit, ?src=ig, ...).
const visitSource = new URLSearchParams(location.search).get("src") || "direct";
document.querySelectorAll("iframe[data-tally-src]").forEach((frame) => {
  frame.dataset.tallySrc += "&src=" + encodeURIComponent(visitSource);
});

function loadTallyForm() {
  if (typeof Tally !== "undefined") {
    Tally.loadEmbeds();
    return;
  }
  document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((frame) => {
    frame.src = frame.dataset.tallySrc;
  });
}

function startTally() {
  const tallyScript = document.createElement("script");
  tallyScript.src = TALLY_SCRIPT;
  tallyScript.onload = loadTallyForm;
  tallyScript.onerror = loadTallyForm;
  document.body.appendChild(tallyScript);
}

// Only load the form when the visitor scrolls near it, so Tally's
// "visits" count people who actually reached the form.
const reservePanel = document.querySelector(".reserve-panel");
if ("IntersectionObserver" in window && reservePanel) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      startTally();
    }
  }, { rootMargin: "300px 0px" });
  observer.observe(reservePanel);
} else {
  startTally();
}
