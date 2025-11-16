import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturedArticle } from '../../models/article';

@Component({
  selector: 'app-feature-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-banner.html',
  styleUrl: './feature-banner.css',
})
export class FeatureBannerComponent {
  @Input() feature?: FeaturedArticle;
}
