"use client";

import { useRef, useState } from "react";

const ACCEPT =
  ".pdf,.docx,.txt,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg";

export function UploadBox({
  label,
  onTextParsed,
}: {
  label: string;
  onTextParsed: (text: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("No file uploaded yet.");

  async function handleFile(file: File) {
    setIsUploading(true);
    setMessage("Uploading...");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Upload failed");
      setFileName(file.name);
      setMessage("Upload successful");
      onTextParsed(json.data.text);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center text-sm transition ${
          isDragging ? "border-pink-400 bg-pink-50/60" : "border-white/70 bg-white/50 hover:bg-white/70"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <p className="font-medium text-slate-700">{isUploading ? "Processing file..." : "Drag and drop or click to upload"}</p>
        <p className="mt-1 text-xs text-slate-500">PDF, DOCX, TXT, JPG, PNG, JPEG</p>
      </div>
      <p className="text-xs text-slate-600">
        {fileName ? `File: ${fileName} - ${message}` : message}
      </p>
    </div>
  );
}
