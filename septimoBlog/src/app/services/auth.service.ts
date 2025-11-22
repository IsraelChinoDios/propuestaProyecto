import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { UserSession } from '../models/article';

interface AuthResponse {
  user: UserSession;
}

interface RegisterPayload {
  nombre: string;
  contrasena: string;
  correo?: string;
  rol?: 'admin' | 'usuario';
  generosFav?: string[];
  sobreMi?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'currentUser';
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly userSignal = signal<UserSession | null>(this.loadFromStorage());

  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(identifier: string, contrasena: string) {
    const payload: any = { contrasena };
    if (identifier && identifier.includes('@')) {
      payload.correo = identifier;
    } else {
      payload.nombre = identifier;
    }
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.setUser(res.user)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.setUser(res.user)));
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  updateStoredUser(user: UserSession): void {
    this.setUser(user);
  }

  private setUser(user: UserSession): void {
    this.userSignal.set(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private loadFromStorage(): UserSession | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
