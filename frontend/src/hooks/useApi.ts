import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Post, type Category, type Document, type Staff, type Department, type Banner, type ExternalLink, type ContactMessage } from '@/lib/api';

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => api.categories.getBySlug(slug),
    enabled: !!slug,
  });
}

// Posts hooks
export function usePosts(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.posts.getAll(params),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['posts', slug],
    queryFn: () => api.posts.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: api.posts.getFeatured,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// export function usePostsByCategory(categorySlug: string, page?: number) {
//   return useQuery({
//     queryKey: ['posts', 'category', categorySlug, page],
//     queryFn: () => api.posts.getByCategory(categorySlug, page),
//     enabled: !!categorySlug,
//   });
// }

export function usePostsByCategory(categorySlug: string, page?: number) {
  return useQuery({
    queryKey: ['posts', 'category', categorySlug, page],
    queryFn: () => {
      console.log("🚀 API CALL usePostsByCategory:", {
        categorySlug,
        page,
        url: `/posts/by_category/?slug=${categorySlug}&page=${page}`
      });

      return api.posts.getByCategory(categorySlug, page);
    },
    enabled: !!categorySlug,
  });
}


// Pages hooks
export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: api.pages.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ['pages', slug],
    queryFn: () => api.pages.getBySlug(slug),
    enabled: !!slug,
  });
}

// Documents hooks
export function useDocuments(params?: { page?: number; doc_type?: string; search?: string }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => api.documents.getAll(params),
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.documents.getById(id),
    enabled: !!id,
  });
}

export function useDownloadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.documents.download(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Departments hooks
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: api.departments.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => api.departments.getById(id),
    enabled: !!id,
  });
}

export function useDepartmentStaff(id: number) {
  return useQuery({
    queryKey: ['departments', id, 'staff'],
    queryFn: () => api.departments.getStaff(id),
    enabled: !!id,
  });
}

// Staff hooks
export function useStaff(params?: { department?: number; search?: string }) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => api.staff.getAll(params),
  });
}

export function useStaffMember(id: number) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.staff.getById(id),
    enabled: !!id,
  });
}

// Photo Albums hooks
export function usePhotoAlbums() {
  return useQuery({
    queryKey: ['photoAlbums'],
    queryFn: api.photoAlbums.getAll,
  });
}

export function usePhotoAlbum(slug: string) {
  return useQuery({
    queryKey: ['photoAlbums', slug],
    queryFn: () => api.photoAlbums.getBySlug(slug),
    enabled: !!slug,
  });
}

// Videos hooks
export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: api.videos.getAll,
  });
}

export function useFeaturedVideos() {
  return useQuery({
    queryKey: ['videos', 'featured'],
    queryFn: api.videos.getFeatured,
  });
}

// Banners hooks
export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: api.banners.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// External Links hooks
export function useExternalLinks() {
  return useQuery({
    queryKey: ['externalLinks'],
    queryFn: api.externalLinks.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Contact hooks
export function useSendContact() {
  return useMutation({
    mutationFn: (data: ContactMessage) => api.contact.send(data),
  });
}
