import { Component, Input } from '@angular/core';
import { FeaturedArticle } from '../../models/article';

@Component({
  selector: 'app-feature-banner',
  standalone: true,
  imports: [],
  templateUrl: './feature-banner.html',
  styleUrl: './feature-banner.css',
})
export class FeatureBannerComponent {
  @Input() feature?: FeaturedArticle;
}
