// Loads the Tally reservation form. If Tally's helper script is blocked,
// the form still loads, it just can't resize itself to fit its content.
const TALLY_SCRIPT = "https://tally.so/widgets/embed.js";

// Tells the form where the visitor came from (?src=reddit, ?src=ig, ...).
const visitSource = new URLSearchParams(location.search).get("src") || "direct";
document.querySelectorAll("iframe[data-tally-src]").forEach((frame) => {
  frame.dataset.tallySrc += "&src=" + encodeURIComponent(visitSource);
});

// Keeps ?src= (and any other query) when switching between EN and DE.
document.querySelectorAll(".lang-switch a").forEach((link) => {
  link.href = link.getAttribute("href") + location.search;
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

// ---- Meta Pixel: loads only after the visitor clicks "Allow" ----
// Pixel ID from Meta Events Manager (dataset "Zappy website").
const META_PIXEL_ID = "2094441404521213";
const CONSENT_KEY = "zappy-meta-consent";

function loadMetaPixel() {
  if (window.fbq) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
}
function saveConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode: ask again next visit */ }
}

function showConsentBar() {
  const bar = document.createElement("div");
  bar.className = "consent-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookie choice");
  const text = document.documentElement.lang === "de"
    ? { ask: "Dürfen wir ein Meta-Cookie nutzen, um zu sehen, über welche Anzeige du zu uns gekommen bist?",
        privacy: "Datenschutz", no: "Nein danke", yes: "Erlauben" }
    : { ask: "May we use a Meta cookie to see which of our ads brought you here?",
        privacy: "Privacy policy", no: "No thanks", yes: "Allow" };
  bar.innerHTML =
    '<p>' + text.ask + ' <a href="legal.html#privacy">' + text.privacy + '</a></p>' +
    '<div class="consent-actions"><button type="button" data-choice="no">' + text.no + '</button>' +
    '<button type="button" data-choice="yes" class="consent-yes">' + text.yes + '</button></div>';
  bar.addEventListener("click", (event) => {
    const choice = event.target.getAttribute("data-choice");
    if (!choice) return;
    saveConsent(choice);
    bar.remove();
    if (choice === "yes") loadMetaPixel();
  });
  document.body.appendChild(bar);
}

const metaConsent = readConsent();
if (metaConsent === "yes") loadMetaPixel();
else if (metaConsent !== "no") showConsentBar();

// Tells Meta when someone submits the reservation form (the "Lead" event).
window.addEventListener("message", (event) => {
  if (event.origin !== "https://tally.so" || !window.fbq) return;
  let data = event.data;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch (e) { return; }
  }
  if (data && data.event === "Tally.FormSubmitted") {
    fbq("track", "Lead", { content_name: "Reserve your Zappy", source: visitSource });
  }
});
