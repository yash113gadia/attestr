export default function CompareView({ currentFile, block }) {
  if (!block?.data) return null;
  const rows = [
    { k: 'Filename', a: currentFile.name, b: block.data.filename },
    { k: 'Size', a: `${(currentFile.size / 1024).toFixed(1)} KB`, b: `${(block.data.fileSize / 1024).toFixed(1)} KB` },
    { k: 'Type', a: currentFile.type, b: block.data.mimeType },
    { k: 'SHA-256', a: currentFile._sha256?.substring(0, 20) + '...', b: block.data.sha256?.substring(0, 20) + '...' },
  ];

  return (
    <div className="border border-rule rounded-sm bg-surface overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-rule-light text-[10px] font-mono text-ink-tertiary tracking-widest">COMPARISON</div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono min-w-[420px]">
          <thead><tr className="bg-surface-raised text-ink-faint text-[10px] tracking-wider">
            <th className="text-left px-3 md:px-4 py-2 font-medium">FIELD</th>
            <th className="text-left px-3 md:px-4 py-2 font-medium">UPLOADED</th>
            <th className="px-2 py-2 w-6"></th>
            <th className="text-left px-3 md:px-4 py-2 font-medium">REGISTERED</th>
          </tr></thead>
          <tbody>{rows.map((r) => {
            const eq = r.k === 'SHA-256' ? currentFile._sha256 === block.data.sha256 : r.a === r.b;
            return (
              <tr key={r.k} className="border-t border-rule-light">
                <td className="px-3 md:px-4 py-2 text-ink-faint">{r.k}</td>
                <td className="px-3 md:px-4 py-2 text-ink truncate max-w-[120px] md:max-w-[180px]">{r.a}</td>
                <td className="px-2 py-2 text-center"><span className={eq ? 'text-verified' : 'text-danger'}>{eq ? '=' : '≠'}</span></td>
                <td className="px-3 md:px-4 py-2 text-ink-secondary truncate max-w-[120px] md:max-w-[180px]">{r.b}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
