import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReviewService, MovieReviewResponse } from '../../services/review.service';
import { ArticleService, UserArticleResponse } from '../../services/article.service';
import { UserService } from '../../services/user.service';

interface User {
  _id: string;
  nombre: string;
  rol: string;
  correo?: string;
}

interface Review {
  _id: string;
  idUsuario: { _id: string; nombre: string } | string;
  resena: string;
  calificacion: number;
  fechaPublicacion?: string;
  movieId?: string;
  movieTitle?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly reviewService = inject(ReviewService);
  private readonly articleService = inject(ArticleService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected movies = signal<MovieReviewResponse[]>([]);
  protected articles = signal<UserArticleResponse[]>([]);
  protected users = signal<User[]>([]);
  protected reviews = signal<Review[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected activeTab = signal<'movies' | 'articles' | 'users' | 'reviews'>('movies');
  protected selectedReview = signal<Review | null>(null);
  protected showReviewModal = signal(false);
  protected showCreateReviewModal = signal(false);
  protected showEditUserModal = signal(false);
  protected showCreateUserModal = signal(false);
  protected showCreateArticleModal = signal(false);
  protected showEditArticleModal = signal(false);
  protected showCreateMovieModal = signal(false);
  protected showEditMovieModal = signal(false);
  protected totalMovies = signal(0);
  protected totalArticles = signal(0);
  protected totalUsers = signal(0);
  protected totalReviews = signal(0);
  protected createReviewForm = signal({
    movieId: '',
    calificacion: 5,
    resena: ''
  });
  protected editUserData = signal<User | null>(null);
  protected editUserForm = signal({
    rol: 'usuario'
  });
  protected createUserForm = signal({
    nombre: '',
    contrasena: '',
    rol: 'usuario'
  });
  protected createArticleForm = signal({
    titulo: '',
    nombrePeli: '',
    anoEstreno: new Date().getFullYear(),
    directores: '',
    cuerpo: '',
    imagenes: [] as File[]
  });
  protected editArticleData = signal<UserArticleResponse | null>(null);
  protected createMovieForm = signal({
    nombrePeli: '',
    anoEstreno: new Date().getFullYear(),
    director: '',
    escritor: '',
    actores: '',
    genero: '',
    sinopsis: '',
    poster: null as File | null
  });
  protected editMovieData = signal<MovieReviewResponse | null>(null);

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.rol !== 'admin') {
      this.router.navigate(['/perfil']);
      return;
    }

    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load movies
    this.reviewService.getMovieReviews().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.totalMovies.set(movies.length);
      },
      error: (err: any) => {
        this.error.set('Error al cargar películas');
        console.error(err);
      }
    });

    // Load articles
    this.loadAllArticles();

    // Load users
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
        this.totalUsers.set(users.length);
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.users.set([]);
      }
    });

    // Load reviews
    this.loadAllReviews();

    this.loading.set(false);
  }

  private loadAllReviews(): void {
    // Fetch movies, then for each movie fetch its populated details (including reviews)
    this.reviewService.getMovieReviews().subscribe({
      next: (movies: MovieReviewResponse[]) => {
        const allReviews: Review[] = [];
        if (!movies || movies.length === 0) {
          this.reviews.set([]);
          this.totalReviews.set(0);
          return;
        }

        let processed = 0;
        movies.forEach((movie) => {
          this.reviewService.getMovieReview(movie._id).subscribe({
            next: (fullMovie) => {
              if (fullMovie.resenas && Array.isArray(fullMovie.resenas)) {
                fullMovie.resenas.forEach((review: any) => {
                  allReviews.push({
                    _id: review._id,
                    idUsuario: review.idUsuario || 'Desconocido',
                    resena: review.resena,
                    calificacion: review.calificacion,
                    fechaPublicacion: review.fechaPublicacion,
                    movieId: fullMovie._id,
                    movieTitle: fullMovie.nombrePeli
                  });
                });
              }
            },
            error: (err: any) => {
              console.error('Error loading movie details for reviews:', err);
            },
            complete: () => {
              processed += 1;
              if (processed === movies.length) {
                // Sort reviews by most recent first
                allReviews.sort((a, b) => {
                  const dateA = new Date(a.fechaPublicacion || 0).getTime();
                  const dateB = new Date(b.fechaPublicacion || 0).getTime();
                  return dateB - dateA;
                });
                this.reviews.set(allReviews);
                this.totalReviews.set(allReviews.length);
              }
            }
          });
        });
      },
      error: (err: any) => {
        console.error('Error loading movies for reviews:', err);
        this.reviews.set([]);
      }
    });
  }

  private loadAllArticles(): void {
    // Fetch all articles (requires admin access or public endpoint)
    this.articleService.getLatestArticles(1000).subscribe({
      next: (articles: UserArticleResponse[]) => {
        this.articles.set(articles);
        this.totalArticles.set(articles.length);
      },
      error: (err: any) => {
        console.error('Error loading articles:', err);
        this.articles.set([]);
      }
    });
  }

  protected setActiveTab(tab: 'movies' | 'articles' | 'users' | 'reviews'): void {
    this.activeTab.set(tab);
  }

  protected deleteMovie(movieId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
      this.reviewService.deleteMovie(movieId).subscribe({
        next: () => {
          this.movies.set(this.movies().filter((m) => m._id !== movieId));
          this.totalMovies.set(this.totalMovies() - 1);
          this.loadAllReviews(); // Refresh reviews since they may have been deleted
        },
        error: (err: any) => {
          console.error('Error al eliminar película:', err);
          alert('Error al eliminar la película');
        }
      });
    }
  }

  protected deleteArticle(articleId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      this.articleService.deleteArticle(articleId).subscribe({
        next: () => {
          this.articles.set(this.articles().filter((a) => a._id !== articleId));
          this.totalArticles.set(this.totalArticles() - 1);
        },
        error: (err: any) => {
          console.error('Error al eliminar artículo:', err);
          alert('Error al eliminar el artículo');
        }
      });
    }
  }

  protected deleteUser(userId: string): void {
    // Check if this is the last admin
    if (this.isLastAdmin(userId)) {
      alert('No puedes eliminar al último administrador del sistema');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users.set(this.users().filter((u) => u._id !== userId));
          this.totalUsers.set(this.totalUsers() - 1);
          this.loadAllReviews(); // Refresh reviews since user's reviews were deleted
        },
        error: (err: any) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  protected deleteReview(reviewId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      const review = this.selectedReview();
      if (review && review.movieId) {
        this.reviewService.deleteReview(review.movieId, reviewId).subscribe({
          next: () => {
            this.reviews.set(this.reviews().filter((r) => r._id !== reviewId));
            this.totalReviews.set(this.totalReviews() - 1);
            // Refresh movies to get updated average rating
            const movieId = review.movieId!;
            this.reviewService.getMovieReview(movieId).subscribe({
              next: (updatedMovie) => {
                const currentMovies = this.movies();
                const idx = currentMovies.findIndex((m) => m._id === movieId);
                if (idx >= 0) {
                  currentMovies[idx] = updatedMovie;
                  this.movies.set([...currentMovies]);
                }
              }
            });
            this.closeReviewModal();
          },
          error: (err: any) => {
            console.error('Error al eliminar reseña:', err);
            alert('Error al eliminar la reseña');
          }
        });
      }
    }
  }

  protected openReviewModal(review: Review): void {
    // set a shallow copy to avoid accidental shared references
    this.selectedReview.set({ ...review });
    this.showReviewModal.set(true);
  }

  protected closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.selectedReview.set(null);
  }

  protected editReview(reviewId: string): void {
    console.log('Edit review:', reviewId);
    // Implement edit logic
  }

  protected goBack(): void {
    this.router.navigate(['/perfil']);
  }

  protected getReviewCount(movie: MovieReviewResponse): number {
    return movie.resenas?.length || 0;
  }

  protected getAuthorName(idUsuario: any): string {
    if (typeof idUsuario === 'string') {
      return idUsuario;
    }
    return idUsuario?.nombre || 'Desconocido';
  }

  protected openCreateReviewModal(): void {
    this.createReviewForm.set({
      movieId: '',
      calificacion: 5,
      resena: ''
    });
    this.showCreateReviewModal.set(true);
  }

  protected closeCreateReviewModal(): void {
    this.showCreateReviewModal.set(false);
    this.createReviewForm.set({
      movieId: '',
      calificacion: 5,
      resena: ''
    });
  }

  protected updateCreateReviewForm(field: string, event: any): void {
    const form = this.createReviewForm();
    let value = event;
    
    // Handle event objects from input/textarea/select
    if (event?.target) {
      value = event.target.value;
    }
    
    this.createReviewForm.set({
      ...form,
      [field]: value
    });
  }

  protected createReview(): void {
    const form = this.createReviewForm();
    if (!form.movieId || !form.resena.trim() || form.calificacion < 1 || form.calificacion > 10) {
      alert('Por favor completa todos los campos correctamente. La calificación debe estar entre 1 y 10.');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser._id) {
      alert('Usuario no autenticado');
      return;
    }

    const payload = {
      idUsuario: currentUser._id,
      resena: form.resena.trim(),
      calificacion: Number(form.calificacion)
    };

    this.reviewService.postReview(form.movieId, payload).subscribe({
      next: () => {
        this.closeCreateReviewModal();
        this.loadAllReviews();
        alert('Reseña creada correctamente');
      },
      error: (err: any) => {
        console.error('Error al crear reseña:', err);
        alert('Error al crear la reseña');
      }
    });
  }

  protected isLastAdmin(userId: string): boolean {
    const adminCount = this.users().filter((u) => u.rol === 'admin').length;
    const userBeingDeleted = this.users().find((u) => u._id === userId);
    return adminCount === 1 && userBeingDeleted?.rol === 'admin';
  }

  protected isEditingLastAdmin(): boolean {
    const userData = this.editUserData();
    if (!userData) return false;
    const adminCount = this.users().filter((u) => u.rol === 'admin').length;
    return adminCount === 1 && userData.rol === 'admin';
  }

  protected openEditUserModal(user: User): void {
    this.editUserData.set({ ...user });
    this.editUserForm.set({ rol: user.rol });
    this.showEditUserModal.set(true);
  }

  protected closeEditUserModal(): void {
    this.showEditUserModal.set(false);
    this.editUserData.set(null);
    this.editUserForm.set({ rol: 'usuario' });
  }

  protected updateUserRole(field: string, event: any): void {
    const form = this.editUserForm();
    let value = event;
    
    if (event?.target) {
      value = event.target.value;
    }
    
    this.editUserForm.set({
      ...form,
      [field]: value
    });
  }

  protected saveUserChanges(): void {
    const userData = this.editUserData();
    const form = this.editUserForm();

    if (!userData || !form.rol) {
      alert('Por favor selecciona un rol');
      return;
    }

    // Validate that we're not removing the last admin
    if (form.rol !== 'admin' && userData.rol === 'admin') {
      const adminCount = this.users().filter((u) => u.rol === 'admin').length;
      if (adminCount === 1) {
        alert('No puedes cambiar el rol del último administrador');
        return;
      }
    }

    // If role hasn't changed, just close modal
    if (form.rol === userData.rol) {
      this.closeEditUserModal();
      return;
    }

    this.userService.updateUser(userData._id, { rol: form.rol as 'admin' | 'usuario' }).subscribe({
      next: () => {
        const currentUsers = this.users();
        const idx = currentUsers.findIndex((u) => u._id === userData._id);
        if (idx >= 0) {
          currentUsers[idx].rol = form.rol;
          this.users.set([...currentUsers]);
        }
        this.closeEditUserModal();
        alert('Rol de usuario actualizado correctamente');
      },
      error: (err: any) => {
        console.error('Error al actualizar usuario:', err);
        alert('Error al actualizar el rol del usuario');
      }
    });
    }

    protected openCreateUserModal(): void {
      this.createUserForm.set({
        nombre: '',
        contrasena: '',
        rol: 'usuario'
      });
      this.showCreateUserModal.set(true);
    }

    protected closeCreateUserModal(): void {
      this.showCreateUserModal.set(false);
      this.createUserForm.set({
        nombre: '',
        contrasena: '',
        rol: 'usuario'
      });
    }

    protected updateCreateUserForm(field: string, event: any): void {
      const form = this.createUserForm();
      let value = event;

      if (event?.target) {
        value = event.target.value;
      }

      this.createUserForm.set({
        ...form,
        [field]: value
      });
    }

    protected createUser(): void {
      const form = this.createUserForm();

      // Validation
      if (!form.nombre.trim() || !form.contrasena.trim()) {
        alert('Por favor completa los campos obligatorios (Nombre de usuario y contraseña)');
        return;
      }

      // Password length validation
      if (form.contrasena.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const payload = {
        nombre: form.nombre.trim(),
        contrasena: form.contrasena,
        rol: form.rol as 'admin' | 'usuario'
      };

      // Create user via auth service (which should have a register endpoint)
      // For now, we'll assume there's an endpoint or we need to create one
      this.authService.register(payload).subscribe({
        next: (response: any) => {
          // Add the new user to the list
          this.users.set([...this.users(), response.user]);
          this.totalUsers.set(this.totalUsers() + 1);
          this.closeCreateUserModal();
          alert('Usuario creado correctamente');
        },
        error: (err: any) => {
          console.error('Error al crear usuario:', err);
          const errorMsg = err?.error?.message || 'Error al crear el usuario';
          alert(errorMsg);
        }
      });
  }

  protected openCreateArticleModal(): void {
    this.createArticleForm.set({
      titulo: '',
      nombrePeli: '',
      anoEstreno: new Date().getFullYear(),
      directores: '',
      cuerpo: '',
      imagenes: []
    });
    this.editArticleData.set(null);
    this.showCreateArticleModal.set(true);
  }

  protected openEditArticleModal(article: UserArticleResponse): void {
    this.editArticleData.set({ ...article });
    this.articleService.getArticleById(article._id).subscribe({
      next: (fullArticle) => {
        this.createArticleForm.set({
          titulo: fullArticle.titulo,
          nombrePeli: fullArticle.nombrePeli || '',
          anoEstreno: fullArticle.anoEstreno || new Date().getFullYear(),
          directores: Array.isArray(fullArticle.directores) ? fullArticle.directores.join(', ') : fullArticle.directores || '',
          cuerpo: fullArticle.cuerpo || '',
          imagenes: []
        });
        this.showEditArticleModal.set(true);
      },
      error: (err: any) => {
        console.error('Error al cargar artículo:', err);
        alert('Error al cargar los datos del artículo');
      }
    });
  }

  protected closeCreateArticleModal(): void {
    this.showCreateArticleModal.set(false);
    this.createArticleForm.set({
      titulo: '',
      nombrePeli: '',
      anoEstreno: new Date().getFullYear(),
      directores: '',
      cuerpo: '',
      imagenes: []
    });
  }

  protected closeEditArticleModal(): void {
    this.showEditArticleModal.set(false);
    this.editArticleData.set(null);
    this.closeCreateArticleModal();
  }

  protected updateCreateArticleForm(field: string, event: any): void {
    const form = this.createArticleForm();
    let value = event;

    if (event?.target) {
      if (field === 'imagenes') {
        value = Array.from((event.target as HTMLInputElement).files || []);
      } else {
        value = event.target.value;
      }
    }

    this.createArticleForm.set({
      ...form,
      [field]: value
    });
  }

  protected saveArticle(): void {
    const form = this.createArticleForm();
    const isEditing = this.editArticleData() !== null;

    // Validation
    if (!form.titulo.trim() || !form.nombrePeli.trim() || !form.directores.trim() || !form.cuerpo.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (form.anoEstreno < 1800 || form.anoEstreno > new Date().getFullYear() + 5) {
      alert('Año de estreno inválido');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser._id) {
      alert('Usuario no autenticado');
      return;
    }

    const directoresArray = form.directores.split(',').map((d) => d.trim()).filter((d) => d);

    if (isEditing) {
      // Update article (PATCH)
      const editData = this.editArticleData()!;
      const updatePayload = {
        titulo: form.titulo.trim(),
        nombrePeli: form.nombrePeli.trim(),
        anoEstreno: Number(form.anoEstreno),
        directores: directoresArray,
        cuerpo: form.cuerpo.trim()
      };

      this.articleService.updateArticle(editData._id, updatePayload).subscribe({
        next: () => {
          const articles = this.articles();
          const idx = articles.findIndex((a) => a._id === editData._id);
          if (idx >= 0) {
            articles[idx] = { ...articles[idx], ...updatePayload };
            this.articles.set([...articles]);
          }
          this.closeEditArticleModal();
          alert('Artículo actualizado correctamente');
        },
        error: (err: any) => {
          console.error('Error al actualizar artículo:', err);
          alert('Error al actualizar el artículo');
        }
      });
    } else {
      // Create article (POST)
      const payload: any = {
        titulo: form.titulo.trim(),
        nombrePeli: form.nombrePeli.trim(),
        anoEstreno: Number(form.anoEstreno),
        directores: directoresArray,
        cuerpo: form.cuerpo.trim(),
        idUsuario: currentUser._id,
        imagenes: form.imagenes
      };

      this.articleService.createArticle(payload).subscribe({
        next: (response: any) => {
          this.articles.set([...this.articles(), response]);
          this.totalArticles.set(this.totalArticles() + 1);
          this.closeCreateArticleModal();
          alert('Artículo creado correctamente');
        },
        error: (err: any) => {
          console.error('Error al crear artículo:', err);
          alert('Error al crear el artículo');
        }
      });
    }
  }

  protected openCreateMovieModal(): void {
    this.createMovieForm.set({
      nombrePeli: '',
      anoEstreno: new Date().getFullYear(),
      director: '',
      escritor: '',
      actores: '',
      genero: '',
      sinopsis: '',
      poster: null
    });
    this.editMovieData.set(null);
    this.showCreateMovieModal.set(true);
  }

  protected openEditMovieModal(movie: MovieReviewResponse): void {
    this.editMovieData.set({ ...movie });
    this.createMovieForm.set({
      nombrePeli: movie.nombrePeli,
      anoEstreno: movie.ano || new Date().getFullYear(),
      director: movie.director || '',
      escritor: movie.escritor || '',
      actores: Array.isArray(movie.actores) ? movie.actores.join(', ') : movie.actores || '',
      genero: movie.genero || '',
      sinopsis: movie.sinopsis || '',
      poster: null
    });
    this.showEditMovieModal.set(true);
  }

  protected closeCreateMovieModal(): void {
    this.showCreateMovieModal.set(false);
    this.createMovieForm.set({
      nombrePeli: '',
      anoEstreno: new Date().getFullYear(),
      director: '',
      escritor: '',
      actores: '',
      genero: '',
      sinopsis: '',
      poster: null
    });
  }

  protected closeEditMovieModal(): void {
    this.showEditMovieModal.set(false);
    this.editMovieData.set(null);
    this.closeCreateMovieModal();
  }

  protected updateCreateMovieForm(field: string, event: any): void {
    const form = this.createMovieForm();
    let value = event;

    if (event?.target) {
      if (field === 'poster') {
        const files = (event.target as HTMLInputElement).files;
        value = files && files.length > 0 ? files[0] : null;
      } else {
        value = event.target.value;
      }
    }

    this.createMovieForm.set({
      ...form,
      [field]: value
    });
  }

  protected saveMovie(): void {
    const form = this.createMovieForm();
    const isEditing = this.editMovieData() !== null;

    // Validation
    if (!form.nombrePeli.trim() || !form.director.trim() || !form.escritor.trim() || 
        !form.actores.trim() || !form.genero.trim() || !form.sinopsis.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (form.anoEstreno < 1800 || form.anoEstreno > new Date().getFullYear() + 5) {
      alert('Año de estreno inválido');
      return;
    }

    if (!isEditing && !form.poster) {
      alert('El póster es obligatorio para crear una película');
      return;
    }

    const actoresArray = form.actores.split(',').map((a) => a.trim()).filter((a) => a);

    if (isEditing) {
      // Update movie
      const editData = this.editMovieData()!;
      const updatePayload: any = {
        nombrePeli: form.nombrePeli.trim(),
        ano: Number(form.anoEstreno),
        director: form.director.trim(),
        escritor: form.escritor.trim(),
        actores: actoresArray,
        genero: form.genero.trim(),
        sinopsis: form.sinopsis.trim()
      };

      this.reviewService.updateMovie(editData._id, updatePayload).subscribe({
        next: () => {
          const movies = this.movies();
          const idx = movies.findIndex((m) => m._id === editData._id);
          if (idx >= 0) {
            movies[idx] = { ...movies[idx], ...updatePayload };
            this.movies.set([...movies]);
          }
          this.closeEditMovieModal();
          alert('Película actualizada correctamente');
        },
        error: (err: any) => {
          console.error('Error al actualizar película:', err);
          alert('Error al actualizar la película');
        }
      });
    } else {
      // Create movie
      if (!form.poster) {
        alert('El póster es obligatorio');
        return;
      }

      this.reviewService
        .createMovieReview(
          {
            nombrePeli: form.nombrePeli.trim(),
            ano: Number(form.anoEstreno),
            director: form.director.trim(),
            escritor: form.escritor.trim(),
            actores: actoresArray,
            genero: form.genero.trim(),
            sinopsis: form.sinopsis.trim()
          },
          form.poster
        )
        .subscribe({
          next: (response: any) => {
            this.movies.set([...this.movies(), response]);
            this.totalMovies.set(this.totalMovies() + 1);
            this.closeCreateMovieModal();
            alert('Película creada correctamente');
          },
          error: (err: any) => {
            console.error('Error al crear película:', err);
            alert('Error al crear la película');
          }
        });
    }
  }
}
