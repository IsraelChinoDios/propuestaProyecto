import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { UserSession } from '../models/article';

interface UserResponse {
  user: UserSession;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  updateUser(id: string, payload: Partial<UserSession>) {
    return this.http
      .patch<UserResponse>(`${this.apiUrl}/users/${id}`, payload)
      .pipe(map((res) => res.user));
  }

  getUserReviewsCount(userId: string) {
    return this.http.get<{ count: number }>(`${this.apiUrl}/users/${userId}/reviews-count`);
  }
}
