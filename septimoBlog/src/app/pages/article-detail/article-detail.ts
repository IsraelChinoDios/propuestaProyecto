import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArticleDetailResponse, ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  protected readonly article = signal<ArticleDetailResponse | null>(null);
  protected readonly userName = signal<string>('');
  protected readonly error = signal<string>('');

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('slug') ?? '';
        if (!id) {
          this.router.navigate(['/articulos']);
          return;
        }
        this.fetchArticle(id);
      });
  }

  private fetchArticle(id: string): void {
    this.articleService.getArticleById(id).subscribe({
      next: (detail) => {
        this.article.set(detail);
        const user = detail.idUsuario as any;
        this.userName.set(typeof user === 'string' ? user : user?.nombre);
        this.error.set('');
      },
      error: () => {
        this.error.set('El artículo no está disponible.');
        this.article.set(null);
      }
    });
  }
}
