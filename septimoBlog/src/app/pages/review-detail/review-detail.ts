import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MOVIE_REVIEW_DETAILS } from '../../data/blog-data';
import { MovieReviewDetail } from '../../models/article';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [],
  templateUrl: './review-detail.html',
  styleUrl: './review-detail.css',
})
export class ReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly detail = signal<MovieReviewDetail | null>(null);
  protected readonly showForm = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('reviewId') ?? '';
        const movie = MOVIE_REVIEW_DETAILS[id];
        if (!movie) {
          this.router.navigate(['/resenas']);
          return;
        }
        this.detail.set(movie);
      });
  }

  protected toggleForm(): void {
    this.showForm.update((value) => !value);
  }
}
