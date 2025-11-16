import { ArticleDetail, ArticleListItem, FeaturedArticle, MovieReviewDetail, Review } from '../models/article';

export const FEATURED_ARTICLE: FeaturedArticle = {
  slug: '/articulos/storytelling-iluminacion',
  title: 'El storytelling en la iluminación',
  subtitle: 'La La Land (2017) · Damien Chazelle',
  author: 'ChinoJuega',
  date: '30 · Agosto · 2024',
  image: 'assets/Imagenes/lalal019.jpg',
  description:
    'Una mirada al uso de la luz como vehículo narrativo: transiciones doradas, azules nocturnos y el brillo que marca cada encuentro entre Mia y Sebastian.',
  highlight: 'Especial'
};

export const RECENT_ARTICLES: ArticleListItem[] = [];
export const ARTICLE_LIST: ArticleListItem[] = [];
export const ARTICLE_DETAILS: Record<string, ArticleDetail> = {};
export const COMMUNITY_REVIEWS: Review[] = [];
export const MOVIE_REVIEW_DETAILS: Record<string, MovieReviewDetail> = {};
