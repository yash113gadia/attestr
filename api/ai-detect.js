import { cors } from './_shared.js';

const HF_TOKEN = process.env.HF_TOKEN || '';
const HF_BASE = 'https://router.huggingface.co/hf-inference/models';
const AI_MODELS = [
  { id: 'umm-maybe/AI-image-detector', name: 'ViT Vision Transformer', weight: 2 },
  { id: 'haywoodsloan/ai-image-detector-deploy', name: 'ResNet Classifier', weight: 2 },
];

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const results = [];

    for (const model of AI_MODELS) {
      try {
        const headers = { 'Content-Type': 'application/octet-stream' };
        if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        const response = await fetch(`${HF_BASE}/${model.id}`, { method: 'POST', headers, body: imageBuffer });
        if (!response.ok) { results.push({ model: model.name, error: 'Model unavailable', scores: null }); continue; }
        const data = await response.json();
        if (Array.isArray(data)) {
          const aiLabel = data.find((d) => { const l = d.label?.toLowerCase(); return l?.includes('ai') || l?.includes('artificial') || l?.includes('fake'); });
          const humanLabel = data.find((d) => { const l = d.label?.toLowerCase(); return l?.includes('human') || l?.includes('real') || l?.includes('authentic'); });
          results.push({ model: model.name, scores: data.map((d) => ({ label: d.label, score: Math.round(d.score * 100) })), aiScore: aiLabel ? Math.round(aiLabel.score * 100) : (humanLabel ? Math.round((1 - humanLabel.score) * 100) : null), humanScore: humanLabel ? Math.round(humanLabel.score * 100) : null });
        } else { results.push({ model: model.name, error: data?.error || 'Unexpected response', scores: null }); }
      } catch (e) { results.push({ model: model.name, error: e.message, scores: null }); }
    }

    const valid = results.filter((r) => r.aiScore != null);
    let avgAiScore = null;
    if (valid.length > 0) {
      let tw = 0, ws = 0;
      for (const r of valid) { const w = AI_MODELS.find((m) => m.name === r.model)?.weight || 1; ws += r.aiScore * w; tw += w; }
      avgAiScore = Math.round(ws / tw);
    }

    let verdict = 'unknown';
    if (avgAiScore != null) { if (avgAiScore >= 65) verdict = 'likely_ai'; else if (avgAiScore >= 35) verdict = 'suspicious'; else verdict = 'likely_authentic'; }

    res.json({ verdict, aiScore: avgAiScore, models: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
