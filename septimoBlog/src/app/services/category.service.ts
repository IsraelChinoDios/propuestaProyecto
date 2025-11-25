import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id: string;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreatePayload {
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(payload: CategoryCreatePayload): Observable<Category> {
    console.log('➕ Creando categoría:', payload);
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload);
  }

  updateCategory(id: string, payload: CategoryCreatePayload): Observable<Category> {
    console.log('✏️ Actualizando categoría:', id, payload);
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    console.log('🗑️ Eliminando categoría:', id);
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }
}
