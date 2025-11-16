import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooterComponent {
  protected readonly year = new Date().getFullYear();
}
