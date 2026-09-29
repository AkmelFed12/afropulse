const ImageTools = (() => {
  'use strict';

  const DEFAULTS = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.82,
    maxSizeMB: 2,
    mimeType: 'image/jpeg'
  };

  function validate(file, maxMB = 5){
    if(!file) return 'Aucun fichier.';
    if(!file.type.startsWith('image/')) return 'Le fichier doit être une image.';
    if(file.size > maxMB * 1024 * 1024) return `Image trop lourde (${maxMB} Mo maximum).`;
    return null;
  }

  function loadImage(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image illisible.'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Lecture du fichier échouée.'));
      reader.readAsDataURL(file);
    });
  }

  function computeDimensions(w, h, maxW, maxH){
    if(w <= maxW && h <= maxH) return { width: w, height: h };
    const ratio = Math.min(maxW / w, maxH / h);
    return {
      width: Math.round(w * ratio),
      height: Math.round(h * ratio)
    };
  }

  async function compress(file, opts = {}){
    const o = { ...DEFAULTS, ...opts };
    const err = validate(file, o.maxSizeMB + 3);
    if(err) throw new Error(err);

    const img = await loadImage(file);
    const { width, height } = computeDimensions(img.width, img.height, o.maxWidth, o.maxHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if(!blob){ reject(new Error('Compression échouée.')); return; }
        const ext = o.mimeType === 'image/webp' ? 'webp' : 'jpg';
        const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.' + ext;
        const compressedFile = new File([blob], name, { type: o.mimeType, lastModified: Date.now() });
        resolve({
          file: compressedFile,
          originalSize: file.size,
          compressedSize: blob.size,
          ratio: Math.round((1 - blob.size / file.size) * 100),
          width,
          height,
          preview: URL.createObjectURL(blob)
        });
      }, o.mimeType, o.quality);
    });
  }

  async function toDataURL(file, opts = {}){
    const result = await compress(file, opts);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(result.file);
    });
  }

  return { compress, validate, toDataURL };
})();

window.ImageTools = ImageTools;