import { Component, Input, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface NavigationItem {
  label: string;
  route?: string | any[];
  url?: string;
  id?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  
  @Input() logo = '';
  @Input() navigation: NavigationItem[] = [];
  @Input() active?: string;
  
  readonly currentUser = this.authService.currentUser;
  
  get isAdmin(): boolean {
    return this.currentUser()?.rol === 'admin';
  }
}
