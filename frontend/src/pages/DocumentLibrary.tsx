import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Download, Eye } from "lucide-react";
import { useDocuments, useDownloadDocument } from "@/hooks/useApi";
import { formatDate, formatFileSize, getMediaUrl } from "@/lib/api";
import type { Document } from "@/lib/api";

const DocumentLibrary = () => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "CONG_VAN" | "QUYET_DINH">("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const { type } = useParams<{ type?: string }>();

  // Đồng bộ tab với URL (chỉ khi load / đổi route)
  useEffect(() => {
    if (type === "cong-van") setActiveTab("CONG_VAN");
    else if (type === "quyet-dinh") setActiveTab("QUYET_DINH");
    else setActiveTab("all");
  }, [type]);

  // doc_type gửi lên API dựa theo tab đang chọn
  const docType = activeTab === "all" ? undefined : activeTab;

  const { data, isLoading } = useDocuments({
    doc_type: docType,
    search: searchTerm,
  });

  const downloadMutation = useDownloadDocument();

  const handleDownload = async (doc: Document) => {
    try {
      await downloadMutation.mutateAsync(doc.id);
      // Use file_url directly (already a complete Cloudinary URL)
      const downloadUrl = doc.file_url || doc.file;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.file_name || doc.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // console.error("Download error:", error);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput.trim() || undefined);
  };

  const DocumentList = ({ docs }: { docs: Document[] }) => (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-all hover-scale group animate-fade-in"
        >
          <div className="flex items-center gap-3 flex-1">
            <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {doc.code ? `[${doc.code}] ` : ""}
                {doc.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(doc.published_date || doc.created_at)}
                {doc.file_size ? ` • ${formatFileSize(doc.file_size)}` : ""}
                {doc.signer ? ` • ${doc.signer}` : ""}
                {doc.download_count > 0 ? ` • ${doc.download_count} lượt tải` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDoc(doc)}
              title="Xem trước"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(doc)}
              disabled={downloadMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Tải xuống
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <Skeleton className="w-5 h-5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  );

  const documents: Document[] = data?.results ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb items={[{ label: "Thư viện văn bản" }]} />

            <h1 className="text-3xl font-bold text-foreground mb-6 animate-fade-in">
              Thư viện Văn bản
            </h1>

            <Card className="bg-card shadow-card overflow-hidden mb-6">
              <div className="p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm văn bản..."
                      className="pl-10"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
              </div>
            </Card>

            <Card className="bg-card shadow-card overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "all" | "CONG_VAN" | "QUYET_DINH")
                }
                className="w-full"
              >
                <div className="border-b border-border">
                  <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent overflow-x-auto">
                    <TabsTrigger
                      value="all"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Tất cả
                    </TabsTrigger>
                    <TabsTrigger
                      value="CONG_VAN"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Công văn
                    </TabsTrigger>
                    <TabsTrigger
                      value="QUYET_DINH"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Quyết định
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  {/* 1 content dùng chung cho mọi tab */}
                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                      <LoadingSkeleton />
                    ) : documents.length > 0 ? (
                      <DocumentList docs={documents} />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Không tìm thấy văn bản nào
                      </p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      <DocumentViewer
        document={selectedDoc}
        open={!!selectedDoc}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      />

      <Footer />
    </div>
  );
};

export default DocumentLibrary;
