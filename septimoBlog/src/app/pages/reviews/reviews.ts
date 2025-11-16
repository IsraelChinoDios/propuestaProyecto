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
  protected loading = true
  protected error = ''

  ngOnInit(): void {
    this.reviewService.getMovieReviews().subscribe({
      next: (movies) => {
        this.reviews = movies.map((movie) => this.toReviewCard(movie))
        this.loading = false
      },
      error: () => {
        this.error = 'No se pudieron cargar las películas para reseñar.'
        this.loading = false
      },
    })
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
