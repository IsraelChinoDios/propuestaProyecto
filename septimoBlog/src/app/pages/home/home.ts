import { Component, OnInit, inject } from '@angular/core';
import { FeatureBannerComponent } from '../../components/feature-banner/feature-banner';
import { ArticleGridComponent } from '../../components/article-grid/article-grid';
import { ArticlePreview, FeaturedArticle } from '../../models/article';
import { ArticleService, UserArticleResponse } from '../../services/article.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FeatureBannerComponent, ArticleGridComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly articleService = inject(ArticleService);

  protected featuredArticle?: FeaturedArticle;
  protected articles: ArticlePreview[] = [];

  ngOnInit(): void {
    this.articleService.getLatestArticles(5).subscribe((articles) => {
      if (!articles.length) {
        this.featuredArticle = undefined;
        this.articles = [];
        return;
      }

      const [first, ...rest] = articles;
      this.featuredArticle = this.toFeatured(first);
      this.articles = rest.slice(0, 4).map((item) => this.toPreview(item));
    });
  }

  private toPreview(article: UserArticleResponse): ArticlePreview {
    const date = new Date(article.fechaPublicacion || article.createdAt).toLocaleDateString();
    const author = this.resolveAuthorName(article.idUsuario);

    return {
      slug: `/articulos/${article._id}`,
      title: article.titulo,
      subtitle: article.nombrePeli || 'Artículo',
      author,
      date,
      image: article.img1 || 'assets/Imagenes/Poster/Poster 4.jpg'
    };
  }

  private toFeatured(article: UserArticleResponse): FeaturedArticle {
    const base = this.toPreview(article);
    const directores = article.directores?.length ? article.directores.join(', ') : '';
    const subtitle = article.nombrePeli
      ? directores
        ? `${article.nombrePeli} · ${directores}`
        : article.nombrePeli
      : base.subtitle;
    const descriptionSource = article.cuerpo || '';
    const description = descriptionSource
      ? `${descriptionSource.slice(0, 180)}${descriptionSource.length > 180 ? '…' : ''}`
      : 'Descubre el último artículo del blog.';

    return { ...base, subtitle, description };
  }

  private resolveAuthorName(author: UserArticleResponse['idUsuario']): string {
    if (author && typeof author === 'object' && 'nombre' in author) {
      return (author as any).nombre as string;
    }
    return 'Autor';
  }
}
