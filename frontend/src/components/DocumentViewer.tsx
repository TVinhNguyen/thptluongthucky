import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Document } from "@/lib/api";

interface DocumentViewerProps {
  document: Document | null;
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
      return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(fileUrl)}`;
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
          <div className="flex items-center justify-between text-sm text-gray-600 px-4">
            <span>File size: {document.formatted_file_size}</span>
            <a href={fileUrl} download={document.title} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
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
            <div className="border rounded-lg overflow-hidden bg-gray-50 mx-4">
              {loading && (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin mb-2">⏳</div>
                    <p className="text-sm text-gray-600">Loading document...</p>
                  </div>
                </div>
              )}
              <iframe
                src={getViewerUrl()}
                className={`w-full h-[600px] border-0 ${loading ? "hidden" : ""}`}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Unable to preview this file. Please download it to view.");
                }}
                allowFullScreen
                title={document.title}
              />
            </div>
          ) : (
            <div className="px-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  File type (.{fileExt}) not supported for preview. Please download to view.
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
        setFetchError("Unable to load text file");
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
          <p className="text-sm text-gray-600">Loading text file...</p>
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
