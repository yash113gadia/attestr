const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  return res.json();
}

export async function registerMedia({ sha256, dHash, filename, fileSize, mimeType, userId, userName }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha256, dHash, filename, fileSize, mimeType, userId, userName }),
  });
  const data = await res.json().catch(() => ({}));
  // Return duplicate info instead of throwing — let the UI handle it
  if (res.status === 409) return { error: data.error, block: data.block, similarity: data.similarity, existingRecord: data.existingRecord };
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
}

export async function verifyMedia({ sha256, dHash }) {
  return request(`${API_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha256, dHash }),
  });
}

export async function getChain() {
  return request(`${API_BASE}/chain`);
}

export async function getMyMedia(userId) {
  return request(`${API_BASE}/my-media/${userId}`);
}

export async function getActivity() {
  return request(`${API_BASE}/activity`);
}

export async function getBlock(sha256) {
  return request(`${API_BASE}/block/${sha256}`);
}

export async function detectAI(imageBase64) {
  return request(`${API_BASE}/ai-detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
}
