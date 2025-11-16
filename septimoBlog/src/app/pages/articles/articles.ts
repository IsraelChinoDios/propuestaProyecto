import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService, UserArticleResponse } from '../../services/article.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './articles.html',
  styleUrl: './articles.css',
})
export class ArticlesComponent {
  private readonly articleService = inject(ArticleService);

  protected articles: Array<UserArticleResponse & { autorNombre: string; preview: string }> = [];
  protected currentSlice: Array<UserArticleResponse & { autorNombre: string; preview: string }> = [];
  protected startIndex = 0;
  protected pageSize = 5;

  constructor() {
    this.articleService.getLatestArticles(this.pageSize * 3).subscribe({
      next: (articles) => {
        this.articles = articles.map((article) => {
          const autor =
            (article.idUsuario && typeof article.idUsuario !== 'string'
              ? article.idUsuario.nombre
              : article.idUsuario) || 'Usuario';
          return {
            ...article,
            autorNombre: autor,
            preview: article.cuerpo ? article.cuerpo.slice(0, 120) + '…' : ''
          };
        });
        this.updateSlice();
      }
    });
  }

  protected canGoPrev(): boolean {
    return this.startIndex > 0;
  }

  protected canGoNext(): boolean {
    return this.startIndex + this.pageSize < this.articles.length;
  }

  protected prev(): void {
    if (this.canGoPrev()) {
      this.startIndex = Math.max(this.startIndex - this.pageSize, 0);
      this.updateSlice();
    }
  }

  protected next(): void {
    if (this.canGoNext()) {
      this.startIndex += this.pageSize;
      this.updateSlice();
    }
  }

  private updateSlice(): void {
    this.currentSlice = this.articles.slice(this.startIndex, this.startIndex + this.pageSize);
  }
}
