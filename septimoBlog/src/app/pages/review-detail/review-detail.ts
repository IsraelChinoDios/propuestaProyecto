import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewService, MovieReviewResponse } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-detail.html',
  styleUrl: './review-detail.css',
})
export class ReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ReviewService);
  protected readonly authService = inject(AuthService);

  protected readonly detail = signal<MovieReviewResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected showForm = signal(false);
  protected submitting = signal(false);
  protected feedback = signal('');
  protected formCalificacion = 0;
  protected formResena = '';

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
    this.loading.set(true);
    this.error.set('');
    this.reviewService.getMovieReview(id).subscribe({
      next: (movie) => {
        this.detail.set(movie);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la película.');
        this.loading.set(false);
      }
    });
  }

  protected toggleForm(): void {
    this.feedback.set('');
    this.showForm.update((v) => !v);
  }

  protected cancelForm(): void {
    this.formCalificacion = 0;
    this.formResena = '';
    this.showForm.set(false);
    this.feedback.set('');
  }

  protected submitReview(): void {
    this.feedback.set('');
    const user = this.authService.currentUser();
    const userId = user?._id || null;
    if (!userId) {
      this.feedback.set('Necesitas iniciar sesión para enviar una reseña.');
      return;
    }

    const cal = Number(this.formCalificacion);
    if (!this.formResena || !cal || cal < 1 || cal > 10) {
      this.feedback.set('Introduce una calificación entre 1 y 10 y escribe tu reseña.');
      return;
    }

    const movieId = this.detail()?._id;
    if (!movieId) {
      this.feedback.set('Error al identificar la película.');
      return;
    }

    this.submitting.set(true);
    this.reviewService.postReview(movieId, { idUsuario: userId, resena: this.formResena, calificacion: cal }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cancelForm();
        // reload movie to show new average
        this.loadMovie(movieId);
      },
      error: (err) => {
        this.submitting.set(false);
        this.feedback.set(err.error?.message ?? 'No se pudo enviar la reseña.');
      }
    });
  }

  protected reviewerName(rev: any): string {
    if (!rev) return 'Usuario';
    const u = rev.idUsuario;
    if (!u) return 'Usuario';
    if (typeof u === 'string') return u;
    return (u.nombre as string) || 'Usuario';
  }
}
