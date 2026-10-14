export function installImageHelpers(tk) {
  // Image helpers shared by the canvas tools. The format is read from the magic
  // bytes rather than the file name, so a renamed text file is still refused.
  tk.BROWSER_IMAGE_KINDS = 'This does not look like a JPEG, PNG, GIF or WebP. Those are the four this page can read.';
  tk.NO_CANVAS = 'This browser cannot process images.';

  tk.imageKind = (bytes) => {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'gif';
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) return 'webp';
    return null;
  };

  // The first twelve bytes are enough to name the format.
  tk.imageKindOfFile = async (file) => tk.imageKind(new Uint8Array(await file.arrayBuffer()).subarray(0, 12));

  tk.loadImage = (blob) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read that image.'));
      };
      img.src = url;
    });

  // Decode a file and gather what the canvas tools need in one object.
  tk.imageSource = async (file, kind) => {
    const img = await tk.loadImage(file);
    return {
      img,
      kind,
      name: file.name || 'image',
      size: file.size,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
  };

  tk.formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Name, size and modification time are enough to tell two picks apart.
  tk.fileKey = (file) => `${file.name}\u0000${file.size}\u0000${file.lastModified}`;

  // A file picker replaces its selection every time it is opened, so a tool that
  // lets people add files in several rounds keeps its own list and asks the input
  // for whatever is new. The caller owns `seen` so repeated picks are ignored.
  tk.claimFiles = (input, seen) => {
    const fresh = [...(input.files || [])].filter((file) => {
      const key = tk.fileKey(file);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    input.value = '';
    return fresh;
  };

}
