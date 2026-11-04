export interface Developer {
  id: string | number;
  name: string;
  icon?: string;
  apps?: App[];
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
  small_description: string;
  markdown_description?: string;
  rating: number;
  reviews?: Review[];
  developer?: Developer | string;
  pricing: string;
}
