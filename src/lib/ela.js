export function performELA(imageFile, quality = 95, scale = 10) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const { width, height } = img;
        const origCanvas = document.createElement('canvas');
        origCanvas.width = width;
        origCanvas.height = height;
        const origCtx = origCanvas.getContext('2d');
        origCtx.drawImage(img, 0, 0);
        const origData = origCtx.getImageData(0, 0, width, height);

        const recompressed = new Image();
        recompressed.onload = () => {
          const reCanvas = document.createElement('canvas');
          reCanvas.width = width;
          reCanvas.height = height;
          const reCtx = reCanvas.getContext('2d');
          reCtx.drawImage(recompressed, 0, 0);
          const reData = reCtx.getImageData(0, 0, width, height);

          const elaCanvas = document.createElement('canvas');
          elaCanvas.width = width;
          elaCanvas.height = height;
          const elaCtx = elaCanvas.getContext('2d');
          const elaData = elaCtx.createImageData(width, height);

          for (let i = 0; i < origData.data.length; i += 4) {
            elaData.data[i] = Math.min(255, Math.abs(origData.data[i] - reData.data[i]) * scale);
            elaData.data[i + 1] = Math.min(255, Math.abs(origData.data[i + 1] - reData.data[i + 1]) * scale);
            elaData.data[i + 2] = Math.min(255, Math.abs(origData.data[i + 2] - reData.data[i + 2]) * scale);
            elaData.data[i + 3] = 255;
          }

          elaCtx.putImageData(elaData, 0, 0);
          resolve(elaCanvas.toDataURL('image/png'));
        };
        recompressed.onerror = () => reject(new Error('Failed to load recompressed image'));
        recompressed.src = origCanvas.toDataURL('image/jpeg', quality / 100);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}
