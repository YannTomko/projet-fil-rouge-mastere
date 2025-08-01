import fs from "fs";

export const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo
const SUSPICIOUS_EXTENSIONS = [".sh", ".exe", ".bat", ".cmd", ".ps1"];

export const hasSuspiciousExtension = (filename: string) => {
  const lower = filename.toLowerCase();
  return SUSPICIOUS_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const cleanupTemp = (filePath?: string) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn("Échec du nettoyage du fichier temporaire :", err);
      }
    });
  }
};