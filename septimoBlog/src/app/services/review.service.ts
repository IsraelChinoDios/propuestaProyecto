import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, mergeMap } from 'rxjs';

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

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
