export function hashFile(file) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/hashWorker.js', import.meta.url),
      { type: 'module' }
    );

    const reader = new FileReader();
    reader.onload = () => {
      worker.postMessage(
        { arrayBuffer: reader.result, type: file.type },
        [reader.result]
      );
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);

    worker.onmessage = (e) => {
      const { type, sha256, dHash, error } = e.data;
      if (type === 'result') {
        worker.terminate();
        resolve({ sha256, dHash });
      } else if (type === 'error') {
        worker.terminate();
        reject(new Error(error));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
}
