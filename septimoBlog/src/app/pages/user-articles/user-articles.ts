import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArticleService, UserArticleResponse } from '../../services/article.service';
import { UserArticle } from '../../models/article';

@Component({
  selector: 'app-user-articles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-articles.html',
  styleUrl: './user-articles.css',
})
export class UserArticlesComponent {
  private readonly authService = inject(AuthService);
  private readonly articleService = inject(ArticleService);

  protected articles: UserArticle[] = [];
  protected currentSlice: UserArticle[] = [];
  protected loading = true;
  protected error = '';
  protected startIndex = 0;
  protected pageSize = 5;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.error = 'Debes iniciar sesión para ver tus artículos.';
      this.loading = false;
      return;
    }

    this.articleService.getArticlesByUser(user._id).subscribe({
      next: (articles: UserArticleResponse[]) => {
        this.articles = articles.map((article) => ({
          id: article._id,
          title: article.titulo,
          date: new Date(article.fechaPublicacion || article.createdAt).toLocaleDateString(),
          image: article.img1 || 'assets/Imagenes/Poster/Poster 4.jpg',
          route: ['/articulos', article._id]
        }));
        this.updateSlice();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus artículos.';
        this.loading = false;
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
