import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Download } from "lucide-react";
import { useDocuments, useDownloadDocument } from "@/hooks/useApi";
import { formatDate, formatFileSize, getMediaUrl } from "@/lib/api";
import type { Document } from "@/lib/api";

const DocumentLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const docTypeMap: Record<string, string | undefined> = {
    all: undefined,
    CONG_VAN: "CONG_VAN",
    QUYET_DINH: "QUYET_DINH",
    TKB: "TKB",
    BIEU_MAU: "BIEU_MAU",
  };

  const { data, isLoading } = useDocuments({
    doc_type: docTypeMap[activeTab],
    search: searchTerm || undefined,
  });

  const downloadMutation = useDownloadDocument();

  const handleDownload = async (doc: Document) => {
    try {
      await downloadMutation.mutateAsync(doc.id);
      // Open file in new tab
      window.open(getMediaUrl(doc.file), '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
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
                {doc.code ? `[${doc.code}] ` : ''}{doc.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(doc.published_date || doc.created_at)} 
                {doc.file_size ? ` • ${formatFileSize(doc.file_size)}` : ''}
                {doc.signer ? ` • ${doc.signer}` : ''}
                {doc.download_count > 0 ? ` • ${doc.download_count} lượt tải` : ''}
              </p>
            </div>
          </div>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb
              items={[
                { label: "Thư viện văn bản" },
              ]}
            />
            
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setSearchTerm(searchTerm)}>Tìm kiếm</Button>
                </div>
              </div>
            </Card>

            <Card className="bg-card shadow-card overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <TabsTrigger 
                      value="TKB"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Thời khóa biểu
                    </TabsTrigger>
                    <TabsTrigger 
                      value="BIEU_MAU"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Biểu mẫu
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-6">
                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                      <LoadingSkeleton />
                    ) : data?.results && data.results.length > 0 ? (
                      <DocumentList docs={data.results} />
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
      
      <Footer />
    </div>
  );
};

export default DocumentLibrary;
