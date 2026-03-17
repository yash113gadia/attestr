// Attestr Media Verifier — Background Service Worker

const API_BASE = "https://attestr-app.vercel.app/api";
const MAX_HISTORY = 50;

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "attestr-verify",
    title: "Verify with Attestr",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "attestr-register",
    title: "Register with Attestr",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "attestr-scan-page",
    title: "Attestr: Scan all images on page",
    contexts: ["page"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "attestr-scan-page") {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "ATTESTR_SCAN_ALL" });
    } catch (_) {}
    return;
  }

  if (info.menuItemId === "attestr-register") {
    const imageUrl = info.srcUrl;
    if (!imageUrl) return;
    await registerSingleImage(imageUrl, tab.id);
    return;
  }

  if (info.menuItemId !== "attestr-verify") return;

  const imageUrl = info.srcUrl;
  if (!imageUrl) return;

  await verifySingleImage(imageUrl, tab.id);
});

// Register a single image by URL (server fetches + hashes + registers)
async function registerSingleImage(imageUrl, tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "ATTESTR_STATUS",
      status: "checking",
      imageUrl,
    });
  } catch (_) {}

  try {
    const response = await fetch(`${API_BASE}/register-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
    });

    const data = await response.json();

    if (response.status === 409) {
      // Already registered — show as verified
      const result = {
        imageUrl,
        hash: data.sha256 || "",
        verified: true,
        status: "verified",
        timestamp: Date.now(),
        details: { status: "verified", message: data.error || "Already registered." },
      };
      await storeVerification(result);
      try {
        await chrome.tabs.sendMessage(tabId, { type: "ATTESTR_RESULT", ...result });
      } catch (_) {}
      return;
    }

    if (data.success) {
      const result = {
        imageUrl,
        hash: data.sha256,
        verified: true,
        status: "verified",
        timestamp: Date.now(),
        details: {
          status: "verified",
          message: `Registered on Ethereum Sepolia. ${data.onChain?.etherscanUrl ? 'Tx: ' + data.onChain.etherscanUrl : ''}`,
          onChain: data.onChain,
        },
      };
      await storeVerification(result);
      try {
        await chrome.tabs.sendMessage(tabId, { type: "ATTESTR_RESULT", ...result });
      } catch (_) {}
    } else {
      throw new Error(data.error || "Registration failed");
    }
  } catch (err) {
    console.error("Attestr registration failed:", err);
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "ATTESTR_RESULT",
        status: "error",
        imageUrl,
        error: err.message,
      });
    } catch (_) {}
  }
}

// Verify a single image and send results to content script + storage
async function verifySingleImage(imageUrl, tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "ATTESTR_STATUS",
      status: "checking",
      imageUrl,
    });
  } catch (_) {}

  try {
    const { sha256, dHash } = await fetchHashAndDHash(imageUrl);
    const result = await verifyWithApi(sha256, dHash, imageUrl);

    await storeVerification(result);

    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "ATTESTR_RESULT",
        ...result,
      });
    } catch (_) {}
  } catch (err) {
    console.error("Attestr verification failed:", err);
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "ATTESTR_RESULT",
        status: "error",
        imageUrl,
        error: err.message,
      });
    } catch (_) {}
  }
}

// Fetch image, compute SHA-256 AND perceptual dHash
async function fetchHashAndDHash(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image (${response.status})`);
  const buffer = await response.arrayBuffer();

  // SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Perceptual dHash via OffscreenCanvas
  let dHash = sha256.substring(0, 64); // fallback
  try {
    const blob = new Blob([buffer]);
    const bitmap = await createImageBitmap(blob);
    const W = 17, H = 16;
    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, W, H);
    const imageData = ctx.getImageData(0, 0, W, H);
    const pixels = imageData.data;

    let hashBits = "";
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < H; x++) {
        const leftIdx = (y * W + x) * 4;
        const rightIdx = (y * W + x + 1) * 4;
        const leftGray = pixels[leftIdx] * 0.299 + pixels[leftIdx + 1] * 0.587 + pixels[leftIdx + 2] * 0.114;
        const rightGray = pixels[rightIdx] * 0.299 + pixels[rightIdx + 1] * 0.587 + pixels[rightIdx + 2] * 0.114;
        hashBits += leftGray < rightGray ? "1" : "0";
      }
    }

    dHash = "";
    for (let i = 0; i < 256; i += 4) {
      dHash += parseInt(hashBits.substring(i, i + 4), 2).toString(16);
    }
    bitmap.close();
  } catch (e) {
    console.warn("dHash computation failed, using SHA-256 fallback:", e.message);
  }

  return { sha256, dHash };
}

// Call Attestr verification API
async function verifyWithApi(sha256, dHash, imageUrl) {
  const response = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha256, dHash }),
  });

  if (!response.ok) {
    throw new Error(`API error (${response.status})`);
  }

  const data = await response.json();

  return {
    imageUrl,
    hash: sha256,
    dHash,
    verified: data.status === "verified" || data.status === "similar",
    status: data.status === "verified" || data.status === "similar" ? "verified" : "unverified",
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

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ATTESTR_VERIFY_URL") {
    (async () => {
      try {
        const { sha256, dHash } = await fetchHashAndDHash(msg.url);
        const result = await verifyWithApi(sha256, dHash, msg.url);
        await storeVerification(result);
        sendResponse({ ok: true, result });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }

  if (msg.type === "ATTESTR_VERIFY_IMAGE") {
    (async () => {
      try {
        const { sha256, dHash } = await fetchHashAndDHash(msg.imageUrl);
        const result = await verifyWithApi(sha256, dHash, msg.imageUrl);
        await storeVerification(result);
        sendResponse({ ok: true, result });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }

  if (msg.type === "ATTESTR_SCAN_TAB") {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          await chrome.tabs.sendMessage(tab.id, { type: "ATTESTR_SCAN_ALL" });
        }
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }
});
