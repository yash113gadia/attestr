// Attestr Extension — Content Script
// Shows verification badge overlays on images.

const BADGE_CLASS = "attestr-badge";

function findImageElement(src) {
  // Try exact match first, then partial match for srcset / proxy URLs
  const imgs = document.querySelectorAll("img");
  for (const img of imgs) {
    if (img.src === src || img.currentSrc === src) return img;
  }
  // Partial match fallback
  for (const img of imgs) {
    if (src.includes(img.src) || img.src.includes(src)) return img;
  }
  return null;
}

function removeBadge(img) {
  const existing = img.parentElement?.querySelector(`.${BADGE_CLASS}`);
  if (existing) existing.remove();
}

function ensureWrapper(img) {
  const parent = img.parentElement;
  if (parent && parent.classList.contains("attestr-wrapper")) return parent;

  const wrapper = document.createElement("span");
  wrapper.classList.add("attestr-wrapper");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
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

  Object.assign(badge.style, {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: bg,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1",
    zIndex: "999999",
    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
    pointerEvents: "none",
    transition: "opacity 0.2s",
  });

  badge.textContent = icon;
  return badge;
}

function showBadge(imageUrl, status) {
  const img = findImageElement(imageUrl);
  if (!img) return;

  const wrapper = ensureWrapper(img);
  removeBadge(img);

  const badge = createBadge(status);
  wrapper.appendChild(badge);

  // Auto-fade non-checking badges after 8 seconds
  if (status !== "checking") {
    setTimeout(() => {
      badge.style.opacity = "0";
      setTimeout(() => badge.remove(), 300);
    }, 8000);
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ATTESTR_STATUS") {
    showBadge(msg.imageUrl, msg.status);
  } else if (msg.type === "ATTESTR_RESULT") {
    showBadge(msg.imageUrl, msg.status || "error");
  }
});
