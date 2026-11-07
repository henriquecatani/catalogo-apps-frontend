export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Developer {
  id: string | number;
  name: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  apps?: App[];
  app_count?: number;
}

export interface Review {
  id: string | number;
  name: string;
  markdown_text: string;
  rating: number;
  app?: App;
}

export interface App {
  id: string | number;
  name: string;
  icon: string;
  link?: string;
  smallDescription?: string;
  small_description?: string;
  markdownDescription?: string;
  markdown_description?: string;
  rating: number;
  category?: string;
  pricing: string;
  developerId?: string | number;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
  developer?: Developer | string;
}
