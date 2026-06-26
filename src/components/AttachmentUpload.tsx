/* ───────────────────────────────────────────
   AttachmentUpload — Photo/file with preview
   ─────────────────────────────────────────── */

import { useState, useRef, useCallback } from "react";
import { X, Camera, FileUp } from "lucide-react";
import { cn, splitAttachments } from "@/lib/utils";
import { compressImageToTargetLimit } from "@/lib/utils";
import { ATTACHMENT_DELIMITER } from "@/config/constants";

interface AttachmentUploadProps {
  value: string;
  onChange: (value: string) => void;
  maxFiles?: number;
  maxBytes?: number;
  accept?: string;
  label?: string;
}

export default function AttachmentUpload({
  value,
  onChange,
  maxFiles = 10,
  maxBytes = 1_500_000,
  accept = "image/*,application/pdf",
  label = "Attachments",
}: AttachmentUploadProps) {
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const files = splitAttachments(value);

  const addFiles = useCallback(
    async (newFiles: string[]) => {
      const combined = [...files, ...newFiles]
        .filter(Boolean)
        .slice(0, maxFiles);
      onChange(combined.join(ATTACHMENT_DELIMITER));
    },
    [files, maxFiles, onChange]
  );

  const removeFile = useCallback(
    (idx: number) => {
      const next = files.filter((_, i) => i !== idx);
      onChange(next.join(ATTACHMENT_DELIMITER));
    },
    [files, onChange]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = e.target.files;
      if (!inputFiles) return;

      setCompressing(true);
      const toAdd: string[] = [];

      for (const file of Array.from(inputFiles)) {
        if (files.length + toAdd.length >= maxFiles) break;

        try {
          const base64 = await readFileAsBase64(file);
          if (file.type.startsWith("image/")) {
            const compressed = await compressImageToTargetLimit(base64, maxBytes);
            toAdd.push(compressed);
          } else if (file.type === "application/pdf") {
            /* PDFs are kept as-is; compressPdfToTargetLimit can be called separately */
            toAdd.push(base64);
          } else {
            toAdd.push(base64);
          }
        } catch {
          /* Skip files that fail to read */
        }
      }

      await addFiles(toAdd);
      setCompressing(false);
      e.target.value = "";
    },
    [files.length, maxFiles, maxBytes, addFiles]
  );

  const handleCapture = useCallback(() => {
    fileRef.current?.click();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--text)]">{label}</label>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((f, idx) => (
            <div
              key={`${f.slice(0, 30)}-${idx}`}
              className="relative aspect-square rounded-lg border overflow-hidden bg-muted"
            >
              {f.startsWith("data:image") || f.match(/^https?:\/\//) ? (
                <img
                  src={f}
                  alt={`Attachment ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : f.startsWith("data:application/pdf") ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileUp className="size-6 mb-1" />
                  <span className="text-[10px] truncate max-w-full px-1">
                    PDF
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileUp className="size-6 mb-1" />
                  <span className="text-[10px] truncate max-w-full px-1">
                    File
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-0.5 right-0.5 size-5 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload controls */}
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          capture="environment"
        />
        <button
          type="button"
          onClick={handleCapture}
          disabled={files.length >= maxFiles || compressing}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-colors",
            files.length >= maxFiles || compressing
              ? "opacity-50 cursor-not-allowed bg-muted"
              : "bg-card hover:bg-accent"
          )}
        >
          <Camera className="size-3.5" />
          {compressing ? "Compressing…" : "Add Photo"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={files.length >= maxFiles || compressing}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-colors",
            files.length >= maxFiles || compressing
              ? "opacity-50 cursor-not-allowed bg-muted"
              : "bg-card hover:bg-accent"
          )}
        >
          <FileUp className="size-3.5" />
          File
        </button>
        <span className="text-[10px] text-muted-foreground self-center ml-auto">
          {files.length}/{maxFiles}
        </span>
      </div>
    </div>
  );
}

/** Read a File as base64 data URL */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
