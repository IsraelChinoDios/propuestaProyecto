import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Review } from '../../models/article';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCardComponent {
  private _review?: Review;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly rating = signal(0);

  @Input({ required: true })
  set review(value: Review) {
    this._review = value;
    this.rating.set(value.rating ?? 0);
  }

  get review(): Review | undefined {
    return this._review;
  }

  protected rate(value: number): void {
    this.rating.set(value);
  }
}
