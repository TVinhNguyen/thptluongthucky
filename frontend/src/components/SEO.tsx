import { Helmet } from "react-helmet-async";

const SITE_NAME = "Trường THPT Lương Thúc Kỳ";
const DEFAULT_DESCRIPTION =
  "Trang thông tin điện tử Trường THPT Lương Thúc Kỳ. Cập nhật tin tức, văn bản, thời khóa biểu, hoạt động giáo dục và các thông tin liên quan.";
const DEFAULT_IMAGE = "/logo_LTK.png";
const SITE_URL = "https://thptluongthucky.edu.vn";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}${DEFAULT_IMAGE}`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:locale" content="vi_VN" />

      {/* Article-specific OG */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// --- JSON-LD Schema Helpers ---

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${DEFAULT_IMAGE}`,
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN",
    },
  };
}

export function articleSchema(post: {
  title: string;
  summary?: string;
  thumbnail?: string | null;
  published_at: string;
  updated_at?: string;
  slug: string;
  category_name?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary || "",
    image: post.thumbnail
      ? post.thumbnail.startsWith("http")
        ? post.thumbnail
        : `${SITE_URL}${post.thumbnail}`
      : `${SITE_URL}${DEFAULT_IMAGE}`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    url: `${SITE_URL}/bai-viet/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${DEFAULT_IMAGE}` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/bai-viet/${post.slug}`,
    },
    ...(post.category_name && {
      articleSection: post.category_name,
    }),
  };
}

export function collectionPageSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${url}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

export function imageGallerySchema(album: {
  name: string;
  description?: string;
  slug: string;
  cover_image_url?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.name,
    description: album.description || "",
    url: `${SITE_URL}/chuyen-muc/anh/${album.slug}`,
    ...(album.cover_image_url && {
      image: album.cover_image_url,
    }),
  };
}

export function breadcrumbSchema(
  items: { label: string; href?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `${SITE_URL}${item.href}` }),
      })),
    ],
  };
}
