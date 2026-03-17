// Attestr Extension — Content Script
// Shows verification badge + info card overlays directly on images.

const MIN_IMAGE_SIZE = 50;
const scannedUrls = new Set();
const imageOverlays = new Map(); // imageUrl → { badge, card, img }

function findImageElement(src) {
  const imgs = document.querySelectorAll("img");
  for (const img of imgs) {
    if (img.src === src || img.currentSrc === src) return img;
  }
  for (const img of imgs) {
    if (src.includes(img.src) || img.src.includes(src)) return img;
  }
  return null;
}

function removeOverlay(imageUrl) {
  const existing = imageOverlays.get(imageUrl);
  if (existing) {
    existing.badge?.remove();
    existing.card?.remove();
    imageOverlays.delete(imageUrl);
  }
}

function createBadge(status) {
  const badge = document.createElement("div");
  badge.className = "attestr-floating-badge";

  let icon, bg;
  switch (status) {
    case "checking": icon = "?"; bg = "#3B82F6"; break;
    case "verified": icon = "\u2713"; bg = "#22C55E"; break;
    case "unverified": icon = "\u2717"; bg = "#EF4444"; break;
    default: icon = "!"; bg = "#6B7280";
  }

  badge.setAttribute("style", [
    "position:fixed !important",
    "width:28px !important",
    "height:28px !important",
    "border-radius:50% !important",
    `background:${bg} !important`,
    "color:#fff !important",
    "display:flex !important",
    "align-items:center !important",
    "justify-content:center !important",
    "font-size:16px !important",
    "font-weight:700 !important",
    "font-family:system-ui,sans-serif !important",
    "line-height:1 !important",
    "z-index:2147483647 !important",
    "box-shadow:0 2px 10px rgba(0,0,0,0.6) !important",
    "pointer-events:auto !important",
    "cursor:pointer !important",
    "transition:transform 0.15s !important",
    "margin:0 !important",
    "padding:0 !important",
    "border:2px solid rgba(255,255,255,0.3) !important",
    status === "checking" ? "animation:attestr-pulse 1.2s infinite !important" : "",
  ].filter(Boolean).join(";"));

  badge.textContent = icon;
  return badge;
}

function createInfoCard(status, details) {
  const card = document.createElement("div");
  card.className = "attestr-floating-card";

  const isVerified = status === "verified";
  const isChecking = status === "checking";
  const borderColor = isVerified ? "#22C55E" : isChecking ? "#3B82F6" : "#EF4444";
  const statusText = isVerified ? "Verified on Blockchain" : isChecking ? "Checking..." : "Not Registered";
  const statusColor = isVerified ? "#22C55E" : isChecking ? "#3B82F6" : "#EF4444";

  let hashLine = "";
  if (details?.hash) {
    hashLine = `<div style="font-family:monospace;font-size:10px;color:#6B7280;margin-top:4px;">SHA-256: ${details.hash.substring(0, 12)}...${details.hash.substring(56)}</div>`;
  }

  let timeLine = "";
  if (details?.details?.message) {
    const msg = details.details.message;
    timeLine = `<div style="font-size:10px;color:#9A9DB0;margin-top:3px;line-height:1.4;">${msg.substring(0, 100)}${msg.length > 100 ? "..." : ""}</div>`;
  }

  let extraLine = "";
  if (isVerified) {
    extraLine = `<div style="display:flex;align-items:center;gap:4px;margin-top:5px;">
      <span style="width:5px;height:5px;border-radius:50%;background:#22C55E;display:inline-block;"></span>
      <span style="font-size:9px;color:#22C55E;font-family:monospace;letter-spacing:0.5px;">ETHEREUM SEPOLIA</span>
    </div>`;
  } else if (!isChecking) {
    extraLine = `<div style="font-size:10px;color:#6B7280;margin-top:4px;">No blockchain registration found.</div>`;
  }

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${statusColor};flex-shrink:0;"></span>
      <span style="font-size:12px;font-weight:600;color:${statusColor};">${statusText}</span>
    </div>
    ${hashLine}${timeLine}${extraLine}
    <div style="display:flex;align-items:center;gap:4px;margin-top:6px;padding-top:5px;border-top:1px solid rgba(255,255,255,0.08);">
      <span style="font-size:9px;color:#5C5F73;font-weight:600;">Attestr</span>
    </div>
  `;

  card.setAttribute("style", [
    "position:fixed !important",
    "z-index:2147483647 !important",
    "background:#0D0E14 !important",
    `border:1px solid ${borderColor}44 !important`,
    "border-radius:8px !important",
    "padding:10px 12px !important",
    "min-width:220px !important",
    "max-width:280px !important",
    "box-shadow:0 4px 24px rgba(0,0,0,0.7) !important",
    "font-family:system-ui,-apple-system,sans-serif !important",
    "opacity:0 !important",
    "transform:translateY(4px) !important",
    "transition:opacity 0.15s,transform 0.15s !important",
    "pointer-events:none !important",
  ].join(";"));

  return card;
}

function positionOverlay(imageUrl) {
  const entry = imageOverlays.get(imageUrl);
  if (!entry) return;
  const { badge, card, img } = entry;

  const rect = img.getBoundingClientRect();
  // Hide if image is off-screen or too small
  if (rect.width < 20 || rect.height < 20 || rect.bottom < 0 || rect.top > window.innerHeight) {
    badge.style.setProperty("display", "none", "important");
    return;
  }

  badge.style.setProperty("display", "flex", "important");
  badge.style.setProperty("top", (rect.top + 8) + "px", "important");
  badge.style.setProperty("left", (rect.right - 36) + "px", "important");

  card.style.setProperty("top", (rect.top + 8) + "px", "important");
  card.style.setProperty("left", Math.max(8, rect.right - 36 - 250) + "px", "important");
}

function showBadge(imageUrl, status, details) {
  const img = findImageElement(imageUrl);
  if (!img) return;

  removeOverlay(imageUrl);

  const badge = createBadge(status);
  const card = createInfoCard(status, details);

  // Append directly to document.body
  document.body.appendChild(badge);
  document.body.appendChild(card);

  imageOverlays.set(imageUrl, { badge, card, img });
  positionOverlay(imageUrl);

  // Hover interactions
  let hoverTimeout;
  badge.addEventListener("mouseenter", () => {
    clearTimeout(hoverTimeout);
    card.style.setProperty("opacity", "1", "important");
    card.style.setProperty("transform", "translateY(0)", "important");
    card.style.setProperty("pointer-events", "auto", "important");
    badge.style.setProperty("transform", "scale(1.15)", "important");
  });

  function hideCard() {
    hoverTimeout = setTimeout(() => {
      if (!card.matches(":hover")) {
        card.style.setProperty("opacity", "0", "important");
        card.style.setProperty("transform", "translateY(4px)", "important");
        card.style.setProperty("pointer-events", "none", "important");
        badge.style.setProperty("transform", "scale(1)", "important");
      }
    }, 150);
  }

  badge.addEventListener("mouseleave", hideCard);
  card.addEventListener("mouseleave", hideCard);
  card.addEventListener("mouseenter", () => clearTimeout(hoverTimeout));
}

// Reposition all overlays on scroll/resize
function repositionAll() {
  for (const [url] of imageOverlays) {
    positionOverlay(url);
  }
}

window.addEventListener("scroll", repositionAll, { passive: true, capture: true });
window.addEventListener("resize", repositionAll, { passive: true });
// Catch scrolling inside containers too
document.addEventListener("scroll", repositionAll, { passive: true, capture: true });
// Reposition periodically for layout shifts
setInterval(repositionAll, 1500);

// Scan all visible images on the page
function scanAllImages() {
  const images = document.querySelectorAll("img");
  let count = 0;

  images.forEach((img) => {
    const src = img.currentSrc || img.src;
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
    if (scannedUrls.has(src)) return;
    if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE) return;

    scannedUrls.add(src);
    count++;

    showBadge(src, "checking", null);

    chrome.runtime.sendMessage(
      { type: "ATTESTR_VERIFY_IMAGE", imageUrl: src },
      (response) => {
        if (chrome.runtime.lastError) {
          showBadge(src, "error", null);
          return;
        }
        if (response?.ok) {
          showBadge(src, response.result.status, response.result);
        } else {
          showBadge(src, "error", null);
        }
      }
    );
  });

  return count;
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ATTESTR_STATUS") {
    showBadge(msg.imageUrl, msg.status, null);
  } else if (msg.type === "ATTESTR_RESULT") {
    showBadge(msg.imageUrl, msg.status || "error", msg);
  } else if (msg.type === "ATTESTR_SCAN_ALL") {
    const count = scanAllImages();
    sendResponse({ count });
  }
});
