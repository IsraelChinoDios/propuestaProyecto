import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, mergeMap, Observable } from 'rxjs';

export interface MovieCreatePayload {
  nombrePeli: string;
  ano: number;
  sinopsis: string;
  calificacionGeneral?: number;
  director: string;
  escritor: string;
  actores: string[];
  genero: string;
  poster: string;
  resenas?: string[];
}

export interface MovieReviewResponse {
  _id: string;
  nombrePeli: string;
  ano: number;
  sinopsis: string;
  calificacionGeneral?: number;
  director: string;
  escritor: string;
  actores: string[];
  genero: string;
  poster: string;
  resenas?: Array<{
    _id: string;
    idUsuario?: { _id?: string; nombre?: string } | string | null;
    resena?: string;
    calificacion?: number;
    fechaPublicacion?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  createMovieReview(payload: Omit<MovieCreatePayload, 'poster'>, posterFile: File) {
    return from(this.fileToBase64(posterFile)).pipe(
      mergeMap((posterBase64) =>
        this.http.post(`${this.apiUrl}/movie-reviews`, {
          ...payload,
          poster: posterBase64
        })
      )
    );
  }

  getMovieReviews(): Observable<MovieReviewResponse[]> {
    return this.http.get<MovieReviewResponse[]>(`${this.apiUrl}/movie-reviews`);
  }

  getMovieReview(id: string): Observable<MovieReviewResponse> {
    return this.http.get<MovieReviewResponse>(`${this.apiUrl}/movie-reviews/${id}`);
  }

  postReview(movieId: string, payload: { idUsuario: string; resena: string; calificacion: number }) {
    return this.http.post(`${this.apiUrl}/movie-reviews/${movieId}/reviews`, payload);
  }

  deleteMovie(id: string): Observable<{ message: string; movie: MovieReviewResponse }> {
    return this.http.delete<{ message: string; movie: MovieReviewResponse }>(`${this.apiUrl}/movie-reviews/${id}`);
  }

  deleteReview(movieId: string, reviewId: string): Observable<{ message: string; review: any; movie: MovieReviewResponse }> {
    return this.http.delete<{ message: string; review: any; movie: MovieReviewResponse }>(
      `${this.apiUrl}/movie-reviews/${movieId}/reviews/${reviewId}`
    );
  }

  updateMovie(id: string, payload: Partial<MovieCreatePayload>): Observable<MovieReviewResponse> {
    return this.http.put<MovieReviewResponse>(`${this.apiUrl}/movie-reviews/${id}`, payload);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
