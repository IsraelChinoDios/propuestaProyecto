import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-create.html',
  styleUrl: './review-create.css',
})
export class ReviewCreateComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ReviewService);
  private readonly categoryService = inject(CategoryService);

  protected form = {
    nombrePeli: '',
    anoEstreno: '',
    director: '',
    escritor: '',
    actores: '',
    genero: '',
    sinopsis: '',
    posterFile: undefined as File | undefined,
  };

  protected feedback = '';
  protected success = false;
  protected loading = false;
  protected categories: Category[] = [];

  ngOnInit(): void {
    // Cargar categorías disponibles
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.form.posterFile = file || undefined;
  }

  protected submit(): void {
    this.feedback = '';
    if (!this.isValid()) {
      this.feedback = 'Completa todos los campos y adjunta el póster.';
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.rol !== 'admin') {
      this.feedback = 'Solo un administrador puede crear reseñas.';
      return;
    }

    const payload = {
      nombrePeli: this.form.nombrePeli,
      ano: Number(this.form.anoEstreno),
      sinopsis: this.form.sinopsis,
      calificacionGeneral: 0,
      director: this.form.director,
      escritor: this.form.escritor,
      actores: this.form.actores.split(',').map((a) => a.trim()).filter(Boolean),
      genero: this.form.genero, // ID de categoría seleccionado
      resenas: [],
    };

    this.loading = true;
    this.reviewService.createMovieReview(payload, this.form.posterFile!).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.feedback = err.error?.message ?? 'No se pudo crear la película para reseñar.';
      }
    });
  }

  protected closeSuccess(): void {
    this.success = false;
    this.router.navigate(['/resenas']);
  }

  protected cancel(): void {
    this.router.navigate(['/perfil']);
  }

  private isValid(): boolean {
    const { nombrePeli, anoEstreno, director, escritor, actores, genero, sinopsis, posterFile } = this.form;
    return !!nombrePeli && !!anoEstreno && !!director && !!escritor && !!actores && !!genero && !!sinopsis && !!posterFile;
  }
}
