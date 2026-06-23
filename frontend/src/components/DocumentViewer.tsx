import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Maximize2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Document, PostAttachment } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface DocumentViewerProps {
  document: Document | PostAttachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document || !open) return;
    setLoading(true);
    setError(null);
  }, [document, open]);

  if (!document) return null;

  const getFileExtension = (filename?: string): string => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const fileExt = getFileExtension(document.file_name);
  const fileUrl = document.file_url || document.file;

  const isPDF = fileExt === "pdf";
  const isWord = ["doc", "docx"].includes(fileExt);
  const isExcel = ["xls", "xlsx"].includes(fileExt);
  const isPowerPoint = ["ppt", "pptx"].includes(fileExt);
  const isText = fileExt === "txt";

  const getViewerUrl = (): string => {
    if (!fileUrl) return "";
    if (isPDF) {
      // Use backend proxy endpoint for PDF (serves with Content-Disposition: inline)
      // file_view_url is a relative path like /api/documents/5/preview/
      // Need to prefix with backend base URL so iframe doesn't hit the frontend router
      const viewUrl = document.file_view_url || fileUrl;
      if (viewUrl.startsWith('/api/') && API_BASE_URL !== '/api') {
        return API_BASE_URL.replace(/\/api$/, '') + viewUrl;
      }
      return viewUrl;
    } else if (isWord || isExcel || isPowerPoint) {
      // Use Microsoft Office Web Viewer for Office documents
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">{document.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground px-4">
            <span>Kích thước: {document.formatted_file_size}</span>
            <a href={fileUrl} download={document.title} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống
              </Button>
            </a>
          </div>

          {error && (
            <div className="px-4">
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {isText ? (
            <TextFileViewer
              url={fileUrl}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Unable to load text file");
              }}
            />
          ) : isPDF || isWord || isExcel || isPowerPoint ? (
            <div className="relative border rounded-lg overflow-hidden bg-gray-50 mx-4">
              {loading && (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin mb-2">⏳</div>
                    <p className="text-sm text-muted-foreground">Đang tải tài liệu...</p>
                  </div>
                </div>
              )}
              <iframe
                src={getViewerUrl()}
                className={`w-full h-[600px] border-0 ${loading ? "hidden" : ""}`}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Không thể xem trước tài liệu này. Vui lòng tải xuống để xem.");
                }}
                allowFullScreen
                title={document.title}
              />
              {!loading && (
                <a
                  href={getViewerUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3"
                >
                  <Button size="icon" variant="secondary" className="shadow-md h-8 w-8">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          ) : (
            <div className="px-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Loại file .{fileExt} không hỗ trợ xem trước. Vui lòng tải xuống để xem.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TextFileViewerProps {
  url: string;
  onLoad: () => void;
  onError: () => void;
}

const TextFileViewer = ({ url, onLoad, onError }: TextFileViewerProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch file");
        const text = await response.text();
        setContent(text);
        setFetchError(null);
        onLoad();
      } catch (err) {
        setFetchError("Không thể tải file văn bản");
        onError();
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [url, onLoad, onError]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 border rounded mx-4">
        <div className="text-center">
          <div className="inline-block animate-spin mb-2">⏳</div>
          <p className="text-sm text-muted-foreground">Đang tải file văn bản...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="px-4">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <pre className="bg-gray-50 border rounded p-4 h-[600px] overflow-auto text-sm whitespace-pre-wrap break-words mx-4">
      {content}
    </pre>
  );
};
