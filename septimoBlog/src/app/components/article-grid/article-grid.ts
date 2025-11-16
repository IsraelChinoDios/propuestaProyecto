import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { ArticlePreview } from '../../models/article';
import { ArticleCardComponent } from '../article-card/article-card';

@Component({
  selector: 'app-article-grid',
  standalone: true,
  imports: [NgFor, ArticleCardComponent],
  templateUrl: './article-grid.html',
  styleUrl: './article-grid.css',
})
export class ArticleGridComponent {
  @Input() title = '';
  @Input() articles: ArticlePreview[] = [];
}
