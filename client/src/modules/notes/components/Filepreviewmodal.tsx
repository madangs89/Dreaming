import React, { useEffect, useRef } from "react";
import type { DocumentBody } from "../notes.type";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
interface FilePreviewModalProps {
  file: DocumentBody | null;
  onClose: () => void;
  isDark: boolean;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  isDark,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [file, onClose]);

  if (!file) return null;

  const bg = isDark ? "#1c1c1c" : "#ffffff";
  const border = isDark ? "#3f3f46" : "#e4e4e7";
  const titleColor = isDark ? "#ffffff" : "#18181b";
  const metaColor = isDark ? "#71717a" : "#a1a1aa";
  const closeColor = isDark ? "#a1a1aa" : "#71717a";
  const closeHover = isDark ? "#ffffff" : "#18181b";

  const isImage = ["image", "png", "jpg", "jpeg", "gif", "webp"].includes(
    file.memetype?.toLowerCase(),
  );
  const isPdf = file.memetype?.toLowerCase() === "pdf";

  const isVideo = ["video", "mp4", "webm", "ogg"].includes(
    file.memetype?.toLowerCase(),
  );

  const isDocument = ["document", "doc", "docx", "txt"].includes(
    file.memetype?.toLowerCase(),
  );
  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full p-4">
          <img
            src={file.url}
            alt={file.title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={file.url}
          title={file.title}
          className="w-full h-full"
          style={{ border: "none" }}
        />
      );
    }
    if (isVideo) {
      return (
        <video
          src={file.url}
          controls
          className="w-full h-full object-contain"
        />
      );
    }
    if (isDocument) {
      return (
        <div className="w-full h-full relative">
          {/* Force internal package wrapper nodes to expand fully */}
          <style>{`
            #react-doc-viewer, 
            #react-doc-viewer > div, 
            #proxy-renderer, 
            #msdoc-renderer, 
            #msdoc-iframe {
              height: 100% !important;
              max-height: 100% !important;
              min-height: 100% !important;
            }
          `}</style>
          <DocViewer
            documents={[{ uri: file.url }]}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
              },
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
      );
    }

    // fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={metaColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p style={{ color: metaColor }} className="text-sm">
          Preview not available
        </p>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: titleColor, borderColor: border }}
          className="text-sm border rounded-lg px-4 py-2 hover:opacity-70 transition-opacity"
        >
          Open file ↗
        </a>
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-[2px]"
    >
      <div
        style={{ backgroundColor: bg, borderColor: border }}
        className="relative w-full max-w-4xl h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderColor: border }}
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        >
          <div className="min-w-0 flex-1 mr-4">
            <p
              style={{ color: titleColor }}
              className="font-medium text-sm truncate"
            >
              {file.title}
            </p>
            <p style={{ color: metaColor }} className="text-xs mt-0.5">
              {new Date(file.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: metaColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = titleColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = metaColor)}
              className="text-xs transition-colors px-2 py-1 rounded"
            >
              Open ↗
            </a>
            <button
              onClick={onClose}
              style={{ color: closeColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = closeHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = closeColor)}
              className="transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto">{renderPreview()}</div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
