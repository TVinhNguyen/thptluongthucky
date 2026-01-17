// Normalize media URLs in rich text content to include API host
export function prependMediaBaseUrl(html: string | undefined | null): string {
  if (!html) return '';

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

  return html.replace(/src="\/media\//g, `src="${baseUrl}/media/`);
}
