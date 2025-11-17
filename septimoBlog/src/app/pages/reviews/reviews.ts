import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ReviewCardComponent } from '../../components/review-card/review-card'
import { Review } from '../../models/article'
import { ReviewService, MovieReviewResponse } from '../../services/review.service'

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCardComponent],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class ReviewsComponent implements OnInit {
  private readonly reviewService = inject(ReviewService)

  protected reviews: Review[] = []
  protected currentSlice: Review[] = []
  protected startIndex = 0
  protected pageSize = 5
  protected loading = true
  protected error = ''

  ngOnInit(): void {
    this.reviewService.getMovieReviews().subscribe({
      next: (movies) => {
        this.reviews = movies.map((movie) => this.toReviewCard(movie))
        this.updateSlice()
        this.loading = false
      },
      error: () => {
        this.error = 'No se pudieron cargar las películas para reseñar.'
        this.loading = false
      },
    })
  }

  protected canGoPrev(): boolean {
    return this.startIndex > 0
  }

  protected canGoNext(): boolean {
    return this.startIndex + this.pageSize < this.reviews.length
  }

  protected prev(): void {
    if (this.canGoPrev()) {
      this.startIndex = Math.max(this.startIndex - this.pageSize, 0)
      this.updateSlice()
    }
  }

  protected next(): void {
    if (this.canGoNext()) {
      this.startIndex += this.pageSize
      this.updateSlice()
    }
  }

  private updateSlice(): void {
    this.currentSlice = this.reviews.slice(this.startIndex, this.startIndex + this.pageSize)
  }

  private toReviewCard(movie: MovieReviewResponse): Review {
    return {
      id: movie._id,
      title: movie.nombrePeli,
      year: String(movie.ano),
      image: movie.poster,
      rating: movie.calificacionGeneral ?? 0,
      ctaLabel: 'Ver detalles',
      detailRoute: ['/resenas', movie._id],
    }
  }
}
