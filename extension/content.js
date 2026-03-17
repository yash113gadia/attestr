// Attestr Extension — Content Script
// Shows verification badge overlays on images with detailed info on hover.
// Supports: right-click verify, scan all images, auto-scan on page load.

const BADGE_CLASS = "attestr-badge";
const CARD_CLASS = "attestr-card";
const MIN_IMAGE_SIZE = 50;
const scannedUrls = new Set();

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

function removeOverlay(wrapper) {
  const existing = wrapper.querySelector(`.${BADGE_CLASS}`);
  if (existing) existing.remove();
  const card = wrapper.querySelector(`.${CARD_CLASS}`);
  if (card) card.remove();
}

function ensureWrapper(img) {
  const parent = img.parentElement;
  if (parent && parent.classList.contains("attestr-wrapper")) return parent;

  const wrapper = document.createElement("span");
  wrapper.classList.add("attestr-wrapper");
  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  return wrapper;
}

function createBadge(status) {
  const badge = document.createElement("span");
  badge.classList.add(BADGE_CLASS);

  let icon, bg;
  switch (status) {
    case "checking":
      icon = "?";
      bg = "#3B82F6";
      break;
    case "verified":
      icon = "\u2713";
      bg = "#22C55E";
      break;
    case "unverified":
      icon = "\u2717";
      bg = "#EF4444";
      break;
    default:
      icon = "!";
      bg = "#6B7280";
  }

  badge.style.cssText = `
    position:absolute; top:6px; right:6px; width:24px; height:24px;
    border-radius:50%; background:${bg}; color:#fff;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; font-family:system-ui,sans-serif;
    line-height:1; z-index:999999; box-shadow:0 1px 6px rgba(0,0,0,0.5);
    pointer-events:none; transition:transform 0.15s;
  `;
  if (status === "checking") {
    badge.style.animation = "attestr-pulse 1.2s infinite";
  }
  badge.textContent = icon;
  return badge;
}

function createInfoCard(status, details) {
  const card = document.createElement("div");
  card.classList.add(CARD_CLASS);

  const isVerified = status === "verified";
  const isChecking = status === "checking";
  const borderColor = isVerified ? "#22C55E" : isChecking ? "#3B82F6" : "#EF4444";
  const statusText = isVerified ? "Verified on Blockchain" : isChecking ? "Checking..." : "Not Registered";
  const statusColor = isVerified ? "#22C55E" : isChecking ? "#3B82F6" : "#EF4444";
  const dotColor = isVerified ? "#22C55E" : isChecking ? "#3B82F6" : "#EF4444";

  let hashLine = "";
  if (details?.hash) {
    hashLine = `<div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:10px;color:#6B7280;margin-top:4px;word-break:break-all;">SHA-256: ${details.hash.substring(0, 12)}...${details.hash.substring(56)}</div>`;
  }

  let timeLine = "";
  if (details?.details?.message) {
    timeLine = `<div style="font-size:10px;color:#9A9DB0;margin-top:3px;line-height:1.4;">${details.details.message.substring(0, 80)}${details.details.message.length > 80 ? '...' : ''}</div>`;
  }

  let networkLine = "";
  if (isVerified) {
    networkLine = `<div style="display:flex;align-items:center;gap:4px;margin-top:5px;">
      <span style="width:5px;height:5px;border-radius:50%;background:#22C55E;display:inline-block;"></span>
      <span style="font-size:9px;color:#22C55E;font-family:'SF Mono',Menlo,monospace;letter-spacing:0.5px;">ETHEREUM SEPOLIA</span>
    </div>`;
  }
  if (!isVerified && !isChecking) {
    networkLine = `<div style="font-size:10px;color:#6B7280;margin-top:4px;">This image has no blockchain registration.</div>`;
  }

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;${isChecking ? 'animation:attestr-pulse 1.2s infinite;' : ''}"></span>
      <span style="font-size:12px;font-weight:600;color:${statusColor};">${statusText}</span>
    </div>
    ${hashLine}
    ${timeLine}
    ${networkLine}
    <div style="display:flex;align-items:center;gap:4px;margin-top:6px;padding-top:5px;border-top:1px solid rgba(255,255,255,0.06);">
      <svg width="10" height="10" viewBox="0 0 200 200" fill="none"><polygon points="100,10 180,46 180,154 100,190 20,154 20,46" fill="none" stroke="#3B82F6" stroke-width="12"/></svg>
      <span style="font-size:9px;color:#5C5F73;font-weight:500;">Attestr</span>
    </div>
  `;

  card.style.cssText = `
    position:absolute; top:6px; right:36px; z-index:999998;
    background:#0D0E14; border:1px solid ${borderColor}33; border-radius:8px;
    padding:10px 12px; min-width:220px; max-width:280px;
    box-shadow:0 4px 20px rgba(0,0,0,0.6);
    font-family:system-ui,-apple-system,sans-serif;
    opacity:0; transform:translateX(4px); transition:opacity 0.15s,transform 0.15s;
    pointer-events:none;
  `;

  return card;
}

function showBadge(imageUrl, status, details) {
  const img = findImageElement(imageUrl);
  if (!img) return;

  const wrapper = ensureWrapper(img);
  removeOverlay(wrapper);

  const badge = createBadge(status);
  const card = createInfoCard(status, details);
  wrapper.appendChild(badge);
  wrapper.appendChild(card);

  // Show card on hover
  wrapper.addEventListener("mouseenter", () => {
    card.style.opacity = "1";
    card.style.transform = "translateX(0)";
    badge.style.transform = "scale(1.15)";
  });
  wrapper.addEventListener("mouseleave", () => {
    card.style.opacity = "0";
    card.style.transform = "translateX(4px)";
    badge.style.transform = "scale(1)";
  });
}

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
