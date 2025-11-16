import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.css',
})
export class ArticleCreateComponent {
  private readonly articleService = inject(ArticleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected form = {
    titulo: '',
    nombrePeli: '',
    anoEstreno: '',
    directores: '',
    cuerpo: '',
    images: [] as File[]
  };

  protected feedback = '';
  protected loading = false;
  protected success = false;

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) {
      return;
    }

    const limitedFiles = Array.from(files).slice(0, 3);
    this.form.images = limitedFiles;
  }

  protected submit(): void {
    this.feedback = '';
    if (!this.isValid()) {
      this.feedback = 'Completa todos los campos y adjunta hasta tres imágenes como máximo.';
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.feedback = 'Debes iniciar sesión para crear un artículo.';
      return;
    }

    this.loading = true;
    this.articleService
      .createArticle({
        titulo: this.form.titulo,
        nombrePeli: this.form.nombrePeli,
        anoEstreno: Number(this.form.anoEstreno),
        directores: this.form.directores.split(',').map((dir) => dir.trim()),
        cuerpo: this.form.cuerpo,
        imagenes: this.form.images,
        idUsuario: currentUser._id
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err) => {
          this.loading = false;
          this.feedback = err.error?.message ?? 'No se pudo crear el artículo.';
        }
      });
  }

  protected closeSuccess(): void {
    this.success = false;
    this.router.navigate(['/mis-articulos']);
  }

  private isValid(): boolean {
    return (
      !!this.form.titulo &&
      !!this.form.nombrePeli &&
      !!this.form.anoEstreno &&
      !!this.form.directores &&
      !!this.form.cuerpo &&
      this.form.images.length <= 3
    );
  }
}
