import { Component, Input, ViewChild, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { CategoryService, Category } from '../../services/category.service';
import { UserSession } from '../../models/article';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly articleService = inject(ArticleService);
  private readonly reviewService = inject(ReviewService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  @Input({ required: true }) user!: UserSession;
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;

  protected editingSobreMi = false;
  protected editingGeneros = false;
  protected sobreMiDraft = '';
  protected generosDraft = '';
  protected articleCount = signal(0);
  protected reviewCount = signal(0);
  protected allCategories = signal<Category[]>([]);
  protected selectedCategories = signal<string[]>([]);
  protected savingGeneros = signal(false);
  protected generosFeedback = signal('');
  protected generosIsError = signal(false);

  ngOnInit(): void {
    this.loadStats();
    this.loadCategories();
    this.initializeSelectedCategories();
  }

  private loadStats(): void {
    // Load user's articles count
    this.articleService.getArticlesByUser(this.user._id).subscribe({
      next: (articles) => this.articleCount.set(articles.length),
      error: () => this.articleCount.set(0)
    });

    // Load user's reviews count from direct endpoint
    this.userService.getUserReviewsCount(this.user._id).subscribe({
      next: (res) => this.reviewCount.set(res.count),
      error: () => this.reviewCount.set(0)
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.allCategories.set(categories),
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  private initializeSelectedCategories(): void {
    if (Array.isArray(this.user.generosFav)) {
      const categoryIds = this.user.generosFav.map((cat: any) => 
        typeof cat === 'string' ? cat : cat._id
      );
      this.selectedCategories.set(categoryIds);
    }
  }

  protected toggleSobreMi(): void {
    this.editingSobreMi = !this.editingSobreMi;
    this.sobreMiDraft = this.user.sobreMi ?? '';
  }

  protected toggleGeneros(): void {
    this.editingGeneros = !this.editingGeneros;
    if (this.editingGeneros) {
      this.initializeSelectedCategories();
    }
  }

  protected toggleCategory(categoryId: string): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      this.selectedCategories.set(current.filter(id => id !== categoryId));
    } else {
      this.selectedCategories.set([...current, categoryId]);
    }
  }

  protected isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories().includes(categoryId);
  }

  protected getGenreName(genre: any): string {
    if (!genre) return 'Sin categoría';

    // Si ya es el objeto Category, devolver su nombre
    if (typeof genre === 'object' && genre?.nombre) {
      return genre.nombre || 'Sin categoría';
    }

    // Si es un ID (string), resolverlo contra las categorías cargadas
    if (typeof genre === 'string') {
      const match = this.allCategories().find((c) => c._id === genre);
      return match?.nombre || 'Sin categoría';
    }

    return 'Sin categoría';
  }

  protected saveSobreMi(): void {
    const payload = { sobreMi: this.sobreMiDraft };
    this.userService.updateUser(this.user._id, payload).subscribe({
      next: (user) => {
        this.user = user;
        this.authService.updateStoredUser(user);
        this.editingSobreMi = false;
      },
      error: (err) => console.error(err)
    });
  }

  protected saveGeneros(): void {
    const generosFav = this.selectedCategories();
    this.generosFeedback.set('');
    this.generosIsError.set(false);
    this.savingGeneros.set(true);

    this.userService.updateUser(this.user._id, { generosFav }).subscribe({
      next: (user) => {
        this.user = user;
        this.authService.updateStoredUser(user);
        this.savingGeneros.set(false);
        this.editingGeneros = false;
        // pequeña confirmación
        this.generosIsError.set(false);
        this.generosFeedback.set('¡Preferencias guardadas!');
        setTimeout(() => this.generosFeedback.set(''), 2000);
      },
      error: (err) => {
        console.error(err);
        this.savingGeneros.set(false);
        this.generosIsError.set(true);
        this.generosFeedback.set(err?.error?.message || 'No se pudieron guardar las preferencias');
      }
    });
  }

  protected openAvatarPicker(): void {
    this.avatarInput?.nativeElement.click();
  }

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result as string;
      this.userService.updateUser(this.user._id, { avatar }).subscribe({
        next: (user) => {
          this.user = user;
          this.authService.updateStoredUser(user);
        },
        error: (err) => console.error(err)
      });
    };
    reader.readAsDataURL(file);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/perfil']);
  }
}
