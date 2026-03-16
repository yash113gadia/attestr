// Attestr Media Verifier — Background Service Worker

const API_URL = "https://hackathon-six-eosin.vercel.app/api/verify";
const MAX_HISTORY = 50;

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "attestr-verify",
    title: "Verify with Attestr",
    contexts: ["image"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "attestr-verify") return;

  const imageUrl = info.srcUrl;
  if (!imageUrl) return;

  // Notify content script that verification is in progress
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "ATTESTR_STATUS",
      status: "checking",
      imageUrl,
    });
  } catch (_) {
    // Content script may not be ready — that's fine
  }

  try {
    const hash = await fetchAndHash(imageUrl);
    const result = await verifyWithApi(hash, imageUrl);

    // Store result
    await storeVerification(result);

    // Send result to content script for badge overlay
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "ATTESTR_RESULT",
        ...result,
      });
    } catch (_) {}

    // Show notification
    // chrome.notifications requires the "notifications" permission;
    // we keep it lightweight and rely on the content-script badge + popup instead.
  } catch (err) {
    console.error("Attestr verification failed:", err);
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "ATTESTR_RESULT",
        status: "error",
        imageUrl,
        error: err.message,
      });
    } catch (_) {}
  }
});

// Fetch image and compute SHA-256
async function fetchAndHash(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image (${response.status})`);
  const buffer = await response.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Call Attestr verification API
async function verifyWithApi(hash, imageUrl) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
  });

  if (!response.ok) {
    throw new Error(`API error (${response.status})`);
  }

  const data = await response.json();

  return {
    imageUrl,
    hash,
    verified: !!data.verified,
    status: data.verified ? "verified" : "unverified",
    timestamp: Date.now(),
    details: data,
  };
}

// Store verification in chrome.storage.local
async function storeVerification(result) {
  const { history = [] } = await chrome.storage.local.get("history");
  history.unshift(result);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  await chrome.storage.local.set({ history });
}

// Allow popup to request a fresh verify (e.g. via URL input)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "ATTESTR_VERIFY_URL") {
    (async () => {
      try {
        const hash = await fetchAndHash(msg.url);
        const result = await verifyWithApi(hash, msg.url);
        await storeVerification(result);
        sendResponse({ ok: true, result });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true; // keep message channel open for async response
  }
});
