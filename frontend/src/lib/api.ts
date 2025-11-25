// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types for API responses
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  sort_order: number;
  created_at: string;
  children: Category[];
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  thumbnail: string | null;
  category: number | null;
  category_name: string;
  is_featured: boolean;
  views: number;
  status: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  code: string;
  title: string;
  doc_type: 'CONG_VAN' | 'QUYET_DINH' | 'TKB' | 'BIEU_MAU';
  file: string;
  file_size: number;
  published_date: string;
  signer: string;
  download_count: number;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  leader_name: string;
  description: string;
  sort_order: number;
  staff_count: number;
}

export interface Staff {
  id: number;
  full_name: string;
  avatar: string | null;
  position: string;
  department: number | null;
  department_name: string;
  email: string;
  phone: string;
  bio: string;
  sort_order: number;
  is_active: boolean;
}

export interface PhotoAlbum {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string | null;
  created_at: string;
  photo_count?: number;
  photos?: Photo[];
}

export interface Photo {
  id: number;
  image: string;
  caption: string;
  sort_order: number;
  uploaded_at: string;
}

export interface Video {
  id: number;
  title: string;
  video_url: string;
  thumbnail: string | null;
  description: string;
  is_featured: boolean;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface ExternalLink {
  id: number;
  title: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API helper function
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// API Service
export const api = {
  // Categories
  categories: {
    getAll: () => fetchAPI<Category[]>('/categories/'),
    getBySlug: (slug: string) => fetchAPI<Category>(`/categories/${slug}/`),
  },

  // Posts
  posts: {
    getAll: (params?: { page?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchAPI<PaginatedResponse<Post>>(`/posts/${query ? `?${query}` : ''}`);
    },
    getBySlug: (slug: string) => fetchAPI<Post>(`/posts/${slug}/`),
    getFeatured: () => fetchAPI<Post[]>('/posts/featured/'),
    getByCategory: (categorySlug: string, page?: number) => {
      const params = new URLSearchParams({ slug: categorySlug });
      if (page) params.set('page', page.toString());
      return fetchAPI<PaginatedResponse<Post>>(`/posts/by_category/?${params}`);
    },
  },

  // Pages
  pages: {
    getAll: () => fetchAPI<Page[]>('/pages/'),
    getBySlug: (slug: string) => fetchAPI<Page>(`/pages/${slug}/`),
  },

  // Documents
  documents: {
    getAll: (params?: { page?: number; doc_type?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.doc_type) searchParams.set('doc_type', params.doc_type);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchAPI<PaginatedResponse<Document>>(`/documents/${query ? `?${query}` : ''}`);
    },
    getById: (id: number) => fetchAPI<Document>(`/documents/${id}/`),
    download: (id: number) => fetchAPI<Document>(`/documents/${id}/download/`, { method: 'POST' }),
  },

  // Departments
  departments: {
    getAll: () => fetchAPI<Department[]>('/departments/'),
    getById: (id: number) => fetchAPI<Department>(`/departments/${id}/`),
    getStaff: (id: number) => fetchAPI<Staff[]>(`/departments/${id}/staff/`),
  },

  // Staff
  staff: {
    getAll: (params?: { department?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.department) searchParams.set('department', params.department.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchAPI<Staff[]>(`/staff/${query ? `?${query}` : ''}`);
    },
    getById: (id: number) => fetchAPI<Staff>(`/staff/${id}/`),
  },

  // Photo Albums
  photoAlbums: {
    getAll: () => fetchAPI<PhotoAlbum[]>('/photo-albums/'),
    getBySlug: (slug: string) => fetchAPI<PhotoAlbum>(`/photo-albums/${slug}/`),
  },

  // Videos
  videos: {
    getAll: () => fetchAPI<Video[]>('/videos/'),
    getFeatured: () => fetchAPI<Video[]>('/videos/featured/'),
    getById: (id: number) => fetchAPI<Video>(`/videos/${id}/`),
  },

  // Banners
  banners: {
    getAll: () => fetchAPI<Banner[]>('/banners/'),
  },

  // External Links
  externalLinks: {
    getAll: () => fetchAPI<ExternalLink[]>('/external-links/'),
  },

  // Contact
  contact: {
    send: (data: ContactMessage) =>
      fetchAPI<{ message: string; data: ContactMessage }>('/contact/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

// Helper function to get media URL
export function getMediaUrl(path: string | null): string {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${path}`;
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
