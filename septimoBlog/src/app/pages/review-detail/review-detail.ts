import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewService, MovieReviewResponse } from '../../services/review.service';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-detail.html',
  styleUrl: './review-detail.css',
})
export class ReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ReviewService);

  protected readonly detail = signal<MovieReviewResponse | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('reviewId') ?? '';
        if (!id) {
          this.router.navigate(['/resenas']);
          return;
        }
        this.loadMovie(id);
      });
  }

  private loadMovie(id: string): void {
    this.reviewService.getMovieReview(id).subscribe({
      next: (movie) => this.detail.set(movie),
      error: () => this.router.navigate(['/resenas'])
    });
  }
}
