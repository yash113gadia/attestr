// Attestr Extension — Popup Script

const historyContainer = document.getElementById("history");

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

function truncateHash(hash) {
  if (!hash || hash.length < 16) return hash || "—";
  return hash.slice(0, 8) + "..." + hash.slice(-8);
}

function statusLabel(status) {
  switch (status) {
    case "verified":
      return "Verified on Blockchain";
    case "unverified":
      return "Not Found";
    default:
      return "Error";
  }
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historyContainer.innerHTML = '<div class="empty-state">No verifications yet</div>';
    return;
  }

  historyContainer.innerHTML = history
    .map(
      (item) => `
    <div class="verify-card">
      <img class="verify-thumb" src="${escapeHtml(item.imageUrl)}" alt="" />
      <div class="verify-info">
        <div class="verify-status ${item.status}">
          <span class="status-dot"></span>
          ${statusLabel(item.status)}
        </div>
        <div class="verify-hash" title="${escapeHtml(item.hash || "")}">${truncateHash(item.hash)}</div>
      </div>
      <div class="verify-time">${timeAgo(item.timestamp)}</div>
    </div>
  `
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Load history on popup open
chrome.storage.local.get("history", ({ history }) => {
  renderHistory(history || []);
});

// Listen for storage changes (if verification happens while popup is open)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.history) {
    renderHistory(changes.history.newValue || []);
  }
});
