import { Component } from '@angular/core';
import { ReviewCardComponent } from '../../components/review-card/review-card';
import { COMMUNITY_REVIEWS } from '../../data/blog-data';
import { Review } from '../../models/article';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ReviewCardComponent],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class ReviewsComponent {
  protected readonly reviews: Review[] = COMMUNITY_REVIEWS;
}
