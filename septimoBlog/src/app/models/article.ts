export interface ArticlePreview {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  image: string;
}

export interface FeaturedArticle extends ArticlePreview {
  description: string;
  highlight?: string;
}

export interface ArticleListItem extends ArticlePreview {
  summary: string;
  orientation: 'image-left' | 'image-right';
  linkLabel?: string;
  route?: string | any[];
}

export interface ArticleDetail extends ArticlePreview {
  content: string[];
  lead?: string;
  summary?: string;
}

export interface Review {
  id: string;
  title: string;
  year: string;
  image: string;
  rating?: number;
  ctaLabel?: string;
  detailRoute?: string | any[];
}

export interface ReviewDetailEntry {
  date: string;
  user: string;
  comment: string;
  score: string;
}

export interface MovieReviewDetail {
  id: string;
  title: string;
  year: string;
  poster: string;
  ratingValue: string;
  ratingVotes: string;
  director: string;
  writer: string;
  stars: string;
  genre: string;
  synopsis: string;
  reviews: ReviewDetailEntry[];
}

export interface UserProfile {
  username: string;
  displayName: string;
  description: string;
  stats: {
    reviews: number;
    articles: number;
  };
  genres: string[];
  avatar: string;
}

export interface UserArticle {
  id: string;
  title: string;
  date: string;
  image: string;
  route?: string | any[];
  preview?: string;
  autorNombre?: string;
}

export interface UserSession {
  _id: string;
  nombre: string;
  sobreMi?: string;
  generosFav: Array<string | { _id: string; nombre: string; descripcion?: string }>;
  idArticulos: number;
  idResenas: number;
  rol: 'admin' | 'usuario';
  avatar?: string;
}
