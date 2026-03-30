import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Download, Eye } from "lucide-react";
import { useDownloadDocument } from "@/hooks/useApi";
import { api, formatDate, formatFileSize, type Document } from "@/lib/api";
import { DOCUMENT_LIBRARY_TEXT, SEARCH_TEXT } from "@/constants/appText";
import { SEO } from "@/components/SEO";

const SearchAll = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const [searchInput, setSearchInput] = useState(query);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const downloadMutation = useDownloadDocument();

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const shouldSearch = query.length > 0;

  const postsQuery = useQuery({
    queryKey: ["search", "posts", query],
    queryFn: () => api.posts.getAll({ search: query }),
    enabled: shouldSearch,
  });

  const documentsQuery = useQuery({
    queryKey: ["search", "documents", query],
    queryFn: () => api.documents.getAll({ search: query }),
    enabled: shouldSearch,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    if (!nextQuery) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: nextQuery });
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadMutation.mutateAsync(doc.id);
      const downloadUrl = doc.file_url || doc.file;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = doc.file_name || doc.title;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // no-op
    }
  };

  const posts = postsQuery.data?.results ?? [];
  const documents = documentsQuery.data?.results ?? [];

  const DocumentList = ({ docs }: { docs: Document[] }) => (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-all hover-scale group animate-fade-in"
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
                {doc.signer ? (
                  <span className="hidden sm:inline"> {` • ${doc.signer}`}</span>
                ) : null}
                {doc.download_count > 0 ? (
                  <span className="hidden sm:inline">
                    {` • ${doc.download_count} ${DOCUMENT_LIBRARY_TEXT.downloadCountLabel}`}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
             <Button
               variant="ghost"
              size="sm"
              onClick={() => setSelectedDoc(doc)}
              title={SEARCH_TEXT.previewTitle}
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
              {SEARCH_TEXT.downloadLabel}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const PostSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );

  const DocumentSkeleton = () => (
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
      <SEO
        title={query ? `Tìm kiếm: ${query}` : "Tìm kiếm"}
        description={`Kết quả tìm kiếm ${query ? `cho "${query}"` : ""} trên Trường THPT Lương Thúc Kỳ`}
        url={`/tim-kiem${query ? `?q=${encodeURIComponent(query)}` : ""}`}
        noindex
      />
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb items={[{ label: SEARCH_TEXT.breadcrumb }]} />

            <h1 className="text-3xl font-bold text-foreground mb-6 animate-fade-in">
              {SEARCH_TEXT.title}
            </h1>

            <Card className="bg-card shadow-card overflow-hidden mb-6">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={SEARCH_TEXT.searchPlaceholder}
                      className="pl-10"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                    />
                  </div>
                  <Button type="submit">{SEARCH_TEXT.searchButton}</Button>
                </div>
              </form>
            </Card>

            {!shouldSearch ? (
              <Card className="bg-card shadow-card p-8 text-center text-muted-foreground">
                {SEARCH_TEXT.emptyHint}
              </Card>
            ) : (
              <div className="space-y-10">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {SEARCH_TEXT.postsTitle}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {postsQuery.data?.count ?? 0} {SEARCH_TEXT.resultsLabel}
                    </span>
                  </div>

                  {postsQuery.isLoading ? (
                    <PostSkeleton />
                  ) : postsQuery.isError ? (
                    <Card className="bg-card shadow-card p-6 text-center text-muted-foreground">
                      {SEARCH_TEXT.postsLoadError}
                    </Card>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.map((post) => (
                        <NewsCard
                          key={post.id}
                          id={post.slug}
                          title={post.title}
                          date={formatDate(post.published_at)}
                          excerpt={post.summary}
                          image={post.thumbnail}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-card shadow-card p-6 text-center text-muted-foreground">
                      {SEARCH_TEXT.postsEmpty}
                    </Card>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {SEARCH_TEXT.documentsTitle}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {documentsQuery.data?.count ?? 0} {SEARCH_TEXT.resultsLabel}
                    </span>
                  </div>

                  {documentsQuery.isLoading ? (
                    <DocumentSkeleton />
                  ) : documentsQuery.isError ? (
                    <Card className="bg-card shadow-card p-6 text-center text-muted-foreground">
                      {SEARCH_TEXT.documentsLoadError}
                    </Card>
                  ) : documents.length > 0 ? (
                    <DocumentList docs={documents} />
                  ) : (
                    <Card className="bg-card shadow-card p-6 text-center text-muted-foreground">
                      {SEARCH_TEXT.documentsEmpty}
                    </Card>
                  )}
                </section>
              </div>
            )}
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

export default SearchAll;


