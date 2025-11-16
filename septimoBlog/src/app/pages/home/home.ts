import { Component } from '@angular/core';
import { FeatureBannerComponent } from '../../components/feature-banner/feature-banner';
import { ArticleGridComponent } from '../../components/article-grid/article-grid';
import { FEATURED_ARTICLE, RECENT_ARTICLES } from '../../data/blog-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FeatureBannerComponent, ArticleGridComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  protected readonly featuredArticle = FEATURED_ARTICLE;
  protected readonly articles = RECENT_ARTICLES;
}
