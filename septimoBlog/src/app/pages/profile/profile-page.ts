import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthComponent } from '../auth/auth';
import { ProfileComponent } from './profile';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, AuthComponent, ProfileComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <app-profile [user]="authService.currentUser()!"></app-profile>
    } @else {
      <app-auth></app-auth>
    }
  `
})
export class ProfilePageComponent {
  protected readonly authService = inject(AuthService);
}
