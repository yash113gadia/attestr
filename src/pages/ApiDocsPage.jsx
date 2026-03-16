import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

const ENDPOINTS = [
  {
    id: 'verify',
    method: 'POST',
    path: '/api/v1/verify',
    title: 'Verify Media',
    description: 'Verify an image against the blockchain and optionally run AI detection. Accepts a base64-encoded image or a public URL.',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'x-api-key', value: 'your-api-key', required: false, note: 'Optional for verify' },
    ],
    body: {
      image: { type: 'string', required: true, description: 'Base64-encoded image (with or without data URI prefix) or a public image URL' },
      includeAI: { type: 'boolean', required: false, description: 'Run AI-generated image detection (default: true)' },
    },
    response: `{
  "sha256": "a1b2c3d4e5f6...",
  "dHash": "f0e1d2c3b4a5...",
  "blockchain": {
    "verified": true,
    "filename": "photo.jpg",
    "fileSize": 204800,
    "mimeType": "image/jpeg",
    "registeredBy": "0x...",
    "timestamp": 1710000000,
    "blockNumber": 12345678,
    "network": "sepolia"
  },
  "aiDetection": {
    "verdict": "likely_authentic",
    "confidence": 12,
    "models": [
      {
        "model": "ViT Vision Transformer",
        "scores": [
          { "label": "human", "score": 88 },
          { "label": "ai", "score": 12 }
        ],
        "aiScore": 12,
        "humanScore": 88
      }
    ]
  },
  "meta": {
    "fileSize": 204800,
    "mimeType": "image/jpeg"
  }
}`,
  },
  {
    id: 'register',
    method: 'POST',
    path: '/api/v1/register',
    title: 'Register Media',
    description: 'Register a new image on the Ethereum Sepolia blockchain. Requires an API key. The image is hashed server-side and the hash is stored on-chain.',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'x-api-key', value: 'your-api-key', required: true },
    ],
    body: {
      image: { type: 'string', required: true, description: 'Base64-encoded image or public image URL' },
      filename: { type: 'string', required: false, description: 'Optional filename for the record (default: "api-upload")' },
    },
    response: `{
  "success": true,
  "sha256": "a1b2c3d4e5f6...",
  "dHash": "f0e1d2c3b4a5...",
  "meta": {
    "fileSize": 204800,
    "mimeType": "image/jpeg",
    "filename": "photo.jpg"
  },
  "onChain": {
    "transactionHash": "0x...",
    "blockNumber": 12345678,
    "etherscanUrl": "https://sepolia.etherscan.io/tx/0x...",
    "network": "sepolia",
    "gasUsed": "85432"
  }
}`,
  },
];

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre className="bg-[#0a0a0a] border border-rule rounded-lg p-4 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-ink-secondary">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-surface-raised/80 border border-rule text-ink-tertiary hover:text-ink transition opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[12px] font-mono rounded transition ${
        active
          ? 'bg-surface-raised text-ink border border-rule'
          : 'text-ink-tertiary hover:text-ink-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function EndpointSection({ endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [codeTab, setCodeTab] = useState('curl');

  const curlExample = endpoint.id === 'verify'
    ? `curl -X POST ${BASE_URL}/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "https://example.com/photo.jpg",
    "includeAI": true
  }'`
    : `curl -X POST ${BASE_URL}/api/v1/register \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key" \\
  -d '{
    "image": "https://example.com/photo.jpg",
    "filename": "photo.jpg"
  }'`;

  const jsExample = endpoint.id === 'verify'
    ? `const response = await fetch("${BASE_URL}/api/v1/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image: "https://example.com/photo.jpg",
    includeAI: true,
  }),
});

const data = await response.json();
console.log(data.blockchain.verified);
console.log(data.aiDetection.verdict);`
    : `const response = await fetch("${BASE_URL}/api/v1/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "your-api-key",
  },
  body: JSON.stringify({
    image: "https://example.com/photo.jpg",
    filename: "photo.jpg",
  }),
});

const data = await response.json();
console.log(data.onChain.transactionHash);`;

  const pythonExample = endpoint.id === 'verify'
    ? `import requests

response = requests.post(
    "${BASE_URL}/api/v1/verify",
    json={
        "image": "https://example.com/photo.jpg",
        "includeAI": True,
    },
)

data = response.json()
print(data["blockchain"]["verified"])
print(data["aiDetection"]["verdict"])`
    : `import requests

response = requests.post(
    "${BASE_URL}/api/v1/register",
    headers={"x-api-key": "your-api-key"},
    json={
        "image": "https://example.com/photo.jpg",
        "filename": "photo.jpg",
    },
)

data = response.json()
print(data["onChain"]["transactionHash"])`;

  const codeExamples = { curl: curlExample, javascript: jsExample, python: pythonExample };

  return (
    <div className="border border-rule rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-raised/50 transition text-left"
      >
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {endpoint.method}
        </span>
        <span className="font-mono text-[13px] text-ink">{endpoint.path}</span>
        <span className="text-[13px] text-ink-tertiary ml-2 hidden sm:inline">{endpoint.title}</span>
        <span className="ml-auto text-ink-tertiary">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-rule px-5 py-5 space-y-6">
          <p className="text-[13px] text-ink-secondary leading-relaxed">{endpoint.description}</p>

          {/* Headers */}
          <div>
            <h4 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider mb-2">Headers</h4>
            <div className="space-y-1">
              {endpoint.headers.map((h) => (
                <div key={h.name} className="flex items-center gap-2 text-[12.5px]">
                  <span className="font-mono text-ink">{h.name}</span>
                  <span className="text-ink-tertiary">:</span>
                  <span className="font-mono text-ink-secondary">{h.value}</span>
                  {h.required && <span className="text-[10px] text-red-400 font-mono">required</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Body params */}
          <div>
            <h4 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider mb-2">Request Body</h4>
            <div className="border border-rule rounded-lg overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-rule bg-surface-raised/30">
                    <th className="text-left px-3 py-2 font-mono text-ink-tertiary font-normal">Field</th>
                    <th className="text-left px-3 py-2 font-mono text-ink-tertiary font-normal">Type</th>
                    <th className="text-left px-3 py-2 font-mono text-ink-tertiary font-normal hidden sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(endpoint.body).map(([key, val]) => (
                    <tr key={key} className="border-b border-rule last:border-0">
                      <td className="px-3 py-2 font-mono text-ink">
                        {key}
                        {val.required && <span className="text-red-400 ml-1">*</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-ink-secondary">{val.type}</td>
                      <td className="px-3 py-2 text-ink-tertiary hidden sm:table-cell">{val.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Response */}
          <div>
            <h4 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider mb-2">Response</h4>
            <CodeBlock code={endpoint.response} language="json" />
          </div>

          {/* Code examples */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <h4 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider mr-3">Examples</h4>
              <TabButton active={codeTab === 'curl'} onClick={() => setCodeTab('curl')}>cURL</TabButton>
              <TabButton active={codeTab === 'javascript'} onClick={() => setCodeTab('javascript')}>JavaScript</TabButton>
              <TabButton active={codeTab === 'python'} onClick={() => setCodeTab('python')}>Python</TabButton>
            </div>
            <CodeBlock code={codeExamples[codeTab]} language={codeTab} />
          </div>
        </div>
      )}
    </div>
  );
}

function TryItSection() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('url');
  const [includeAI, setIncludeAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let image = input;

      if (inputType === 'file') {
        // input is already base64 from file upload
        image = input;
      }

      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, includeAI }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(reader.result);
      setInputType('file');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="border border-rule rounded-xl p-5 space-y-4">
      <h3 className="font-serif text-[20px] text-ink">Try it</h3>
      <p className="text-[13px] text-ink-tertiary">
        Test the verify endpoint live. Paste an image URL or upload a file.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <TabButton active={inputType === 'url'} onClick={() => { setInputType('url'); setInput(''); }}>URL</TabButton>
          <TabButton active={inputType === 'file'} onClick={() => setInputType('file')}>File Upload</TabButton>
        </div>

        {inputType === 'url' ? (
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-rule rounded-lg px-4 py-2.5 text-[13px] font-mono text-ink placeholder:text-ink-tertiary/50 focus:outline-none focus:border-ink-tertiary transition"
          />
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-[13px] text-ink-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-rule file:bg-surface-raised file:text-ink file:text-[12px] file:font-mono file:cursor-pointer hover:file:bg-surface-raised/80 file:transition"
            />
            {input && inputType === 'file' && (
              <p className="text-[11px] text-ink-tertiary mt-1 font-mono">File loaded ({Math.round(input.length * 0.75 / 1024)} KB)</p>
            )}
          </div>
        )}

        <label className="flex items-center gap-2 text-[13px] text-ink-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={includeAI}
            onChange={(e) => setIncludeAI(e.target.checked)}
            className="rounded border-rule accent-emerald-500"
          />
          Include AI detection
        </label>

        <button
          type="submit"
          disabled={loading || !input}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-void text-[13px] font-medium hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[13px] text-red-400 font-mono">
          Error: {error}
        </div>
      )}

      {result && (
        <div>
          <h4 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider mb-2">Response</h4>
          <CodeBlock code={JSON.stringify(result, null, 2)} language="json" />
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <motion.div initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <motion.div variants={fade} custom={0} className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-ink-tertiary" />
          <h1 className="font-serif text-[28px] md:text-[36px] text-ink leading-none tracking-tight">
            API Reference
          </h1>
        </div>
        <p className="text-[14px] text-ink-secondary leading-relaxed max-w-xl">
          Integrate Attestr into your application. Verify media authenticity and register content on the Ethereum blockchain programmatically.
        </p>
      </motion.div>

      {/* Base URL */}
      <motion.div variants={fade} custom={1}>
        <div className="border border-rule rounded-xl p-5 space-y-3">
          <h3 className="text-[12px] font-mono text-ink-tertiary uppercase tracking-wider">Base URL</h3>
          <div className="bg-[#0a0a0a] border border-rule rounded-lg px-4 py-2.5">
            <code className="text-[13px] font-mono text-ink">{BASE_URL || 'https://your-domain.vercel.app'}</code>
          </div>
        </div>
      </motion.div>

      {/* Authentication */}
      <motion.div variants={fade} custom={2}>
        <div className="border border-rule rounded-xl p-5 space-y-3">
          <h3 className="font-serif text-[20px] text-ink">Authentication</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed">
            The <span className="font-mono text-ink">/api/v1/verify</span> endpoint is open and does not require authentication.
            The <span className="font-mono text-ink">/api/v1/register</span> endpoint requires an API key passed via the{' '}
            <span className="font-mono text-ink">x-api-key</span> header.
          </p>
          <CodeBlock code={`// Include in request headers\n{ "x-api-key": "your-api-key" }`} language="json" />
        </div>
      </motion.div>

      {/* Rate Limits */}
      <motion.div variants={fade} custom={3}>
        <div className="border border-rule rounded-xl p-5 space-y-3">
          <h3 className="font-serif text-[20px] text-ink">Rate Limits</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed">
            Rate limit information is included in every response via headers:
          </p>
          <div className="space-y-1 text-[12.5px]">
            <div className="flex gap-2">
              <span className="font-mono text-ink">X-RateLimit-Limit</span>
              <span className="text-ink-tertiary">-- Max requests per hour</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono text-ink">X-RateLimit-Remaining</span>
              <span className="text-ink-tertiary">-- Remaining requests</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono text-ink">X-RateLimit-Reset</span>
              <span className="text-ink-tertiary">-- Unix timestamp when the limit resets</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Endpoints */}
      <motion.div variants={fade} custom={4} className="space-y-4">
        <h2 className="font-serif text-[22px] text-ink">Endpoints</h2>
        {ENDPOINTS.map((ep) => (
          <EndpointSection key={ep.id} endpoint={ep} />
        ))}
      </motion.div>

      {/* Try It */}
      <motion.div variants={fade} custom={5}>
        <TryItSection />
      </motion.div>
    </motion.div>
  );
}
