export const SIDEBAR_SEARCH_CONFIG = {
  BASE_PATH: '/chuyen-muc',
  THI_KIEM_TRA: {
    category: 'thi-kiem-tra',
    keywords: 'thi|kiểm tra',
  },
};

export const buildCategoryUrl = (
  category: string,
  searchKeywords?: string,
  basePath = '/chuyen-muc'
): string => {
  const base = `${basePath}/${category}`;
  return searchKeywords ? `${base}?search=${searchKeywords}` : base;
};
