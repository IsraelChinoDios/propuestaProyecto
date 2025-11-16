import { Component, Input } from '@angular/core';
import { ArticlePreview } from '../../models/article';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: ArticlePreview;
}
