import { Helmet } from "react-helmet-async";

const SITE_NAME = "Trường THPT Lương Thúc Kỳ";
const DEFAULT_DESCRIPTION =
  "Trang thông tin điện tử Trường THPT Lương Thúc Kỳ. Cập nhật tin tức, văn bản, thời khóa biểu, hoạt động giáo dục và các thông tin liên quan.";
const DEFAULT_IMAGE = "/logo_LTK.png";
const SITE_URL = "https://thptluongthucky.edu.vn";
const SCHOOL_TELEPHONE = "0235 376 5199";
const SCHOOL_EMAIL = "nguyentandh@gmail.com";
const SCHOOL_ADDRESS = "Thôn Nghĩa Hiệp, Xã Đại Lộc, Thành phố Đà Nẵng";
const SCHOOL_LATITUDE = 15.886681405854894;
const SCHOOL_LONGITUDE = 108.121433729357;
const SCHOOL_FACEBOOK = "https://www.facebook.com/doanluongthucky";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  keywords?: string[];
  locale?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageType?: string;
  twitterSite?: string;
  author?: string;
  prevUrl?: string;
  nextUrl?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

const toAbsoluteUrl = (value: string) => {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  canonical,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
  keywords,
  locale = "vi_VN",
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogImageType,
  twitterSite = "@thptluongthucky",
  author,
  prevUrl,
  nextUrl,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullImage = image ? toAbsoluteUrl(image) : `${SITE_URL}${DEFAULT_IMAGE}`;
  const fullUrl = url ? toAbsoluteUrl(url) : SITE_URL;
  const canonicalUrl = canonical ? toAbsoluteUrl(canonical) : fullUrl;
  const robotsContent = noindex ? "noindex, nofollow" : DEFAULT_ROBOTS;
  const resolvedImageType = ogImageType
    ?? (fullImage.endsWith(".png") ? "image/png"
      : fullImage.endsWith(".gif") ? "image/gif"
      : "image/jpeg");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      {keywords?.length ? <meta name="keywords" content={keywords.join(", ")} /> : null}
      {author ? <meta name="author" content={author} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      {prevUrl ? <link rel="prev" href={toAbsoluteUrl(prevUrl)} /> : null}
      {nextUrl ? <link rel="next" href={toAbsoluteUrl(nextUrl)} /> : null}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      <meta property="og:image:type" content={resolvedImageType} />
      {ogImageAlt ? <meta property="og:image:alt" content={ogImageAlt} /> : null}
      {ogImageWidth ? <meta property="og:image:width" content={`${ogImageWidth}`} /> : null}
      {ogImageHeight ? <meta property="og:image:height" content={`${ogImageHeight}`} /> : null}
      <meta property="og:locale" content={locale} />

      {/* Article-specific OG */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {ogImageAlt ? <meta name="twitter:image:alt" content={ogImageAlt} /> : null}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
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
    alternateName: "THPT Lương Thúc Kỳ",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${DEFAULT_IMAGE}`,
      width: 500,
      height: 500,
    },
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    description: DEFAULT_DESCRIPTION,
    telephone: SCHOOL_TELEPHONE,
    email: SCHOOL_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: SCHOOL_ADDRESS,
      addressLocality: "Đà Nẵng",
      addressRegion: "Đà Nẵng",
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SCHOOL_LATITUDE,
      longitude: SCHOOL_LONGITUDE,
    },
    hasMap: `https://www.google.com/maps?q=${SCHOOL_LATITUDE},${SCHOOL_LONGITUDE}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "07:30",
        closes: "11:30",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SCHOOL_TELEPHONE,
      contactType: "customer service",
      availableLanguage: "Vietnamese",
    },
    sameAs: [SCHOOL_FACEBOOK],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tim-kiem?q={search_term_string}`,
      "query-input": "required name=search_term_string",
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

export function videoObjectSchema(video: {
  title: string;
  description?: string;
  thumbnail?: string | null;
  video_url?: string | null;
  video_file?: string | { url: string } | null;
  created_at?: string;
}) {
  const thumbnailUrl = typeof video.thumbnail === "string"
    ? video.thumbnail
    : (video.thumbnail as { url?: string } | null)?.url || `${SITE_URL}${DEFAULT_IMAGE}`;
  const contentUrl = video.video_url
    || (typeof video.video_file === "string" ? video.video_file : video.video_file?.url)
    || "";

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl,
    ...(contentUrl && { contentUrl }),
    uploadDate: video.created_at || new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${DEFAULT_IMAGE}` },
    },
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
