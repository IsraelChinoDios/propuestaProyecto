import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, mergeMap, Observable } from 'rxjs';

export interface ArticleCreatePayload {
  titulo: string;
  nombrePeli: string;
  anoEstreno: number;
  directores: string[];
  cuerpo: string;
  imagenes: File[];
  idUsuario: string;
}

export interface UserArticleResponse {
  _id: string;
  titulo: string;
  nombrePeli?: string;
  anoEstreno?: number;
  directores?: string[];
  fechaPublicacion?: string;
  createdAt: string;
  img1?: string;
  cuerpo?: string;
  idUsuario?: { _id: string; nombre: string } | string;
}

export interface ArticleDetailResponse extends UserArticleResponse {
  nombrePeli: string;
  anoEstreno: number;
  directores: string[];
  cuerpo: string;
  img2?: string;
  img3?: string;
  idUsuario: { _id: string; nombre: string } | string;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  createArticle(payload: ArticleCreatePayload) {
    const { imagenes, ...rest } = payload;
    return from(this.filesToBase64(imagenes)).pipe(
      mergeMap((imagesBase64) =>
        this.http.post(`${this.apiUrl}/articles`, {
          ...rest,
          img1: imagesBase64[0],
          img2: imagesBase64[1],
          img3: imagesBase64[2]
        })
      )
    );
  }

  getArticlesByUser(userId: string): Observable<UserArticleResponse[]> {
    return this.http.get<UserArticleResponse[]>(`${this.apiUrl}/articles`, {
      params: { userId }
    });
  }

  getLatestArticles(limit: number): Observable<UserArticleResponse[]> {
    return this.http.get<UserArticleResponse[]>(`${this.apiUrl}/articles`, {
      params: { limit }
    });
  }

  getArticleById(id: string): Observable<ArticleDetailResponse> {
    return this.http.get<ArticleDetailResponse>(`${this.apiUrl}/articles/${id}`);
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${id}`);
  }

  updateArticle(id: string, payload: any): Observable<UserArticleResponse> {
    return this.http.put<UserArticleResponse>(`${this.apiUrl}/articles/${id}`, payload);
  }

  private filesToBase64(files: File[]): Promise<string[]> {
    const promises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(promises);
  }
}
