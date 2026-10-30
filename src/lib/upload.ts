/** Validación de archivos subidos: tipo real por "magic bytes", tamaño y cantidad. */
export const UPLOAD_LIMITS = { maxFiles: 6, maxBytes: 5 * 1024 * 1024 };

const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

export function detectImage(bytes: Uint8Array): { mime: string; ext: string } | null {
  const sig = SIGNATURES.find((s) => bytes.length > 12 && s.test(bytes));
  return sig ? { mime: sig.mime, ext: sig.ext } : null;
}

export function validateUpload(bytes: Uint8Array, declaredSize: number): string | null {
  if (declaredSize > UPLOAD_LIMITS.maxBytes || bytes.length > UPLOAD_LIMITS.maxBytes) return "Archivo supera 5 MB";
  if (!detectImage(bytes)) return "Solo se permiten imágenes JPG, PNG o WEBP";
  return null;
}
