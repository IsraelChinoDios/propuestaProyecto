import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { HeaderComponent, NavigationItem } from './components/header/header';
import { SiteFooterComponent } from './components/site-footer/site-footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SiteFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  protected readonly logo = 'assets/Imagenes/1.png';
  protected readonly navigation: NavigationItem[] = [
    { id: 'inicio', label: 'INICIO', route: '/' },
    { id: 'articulos', label: 'ARTÍCULOS', route: '/articulos' },
    { id: 'resenas', label: 'RESEÑAS', route: '/resenas' },
    { id: 'perfil', label: 'PERFIL', route: '/perfil' }
  ];
  protected readonly currentSection = signal('inicio');

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => this.updateActiveSection(event.urlAfterRedirects));

    this.updateActiveSection(this.router.url);
  }

  private updateActiveSection(url: string): void {
    if (url.startsWith('/articulos')) {
      this.currentSection.set('articulos');
    } else if (url.startsWith('/resenas')) {
      this.currentSection.set('resenas');
    } else if (url.startsWith('/perfil')) {
      this.currentSection.set('perfil');
    } else {
      this.currentSection.set('inicio');
    }
  }
}
