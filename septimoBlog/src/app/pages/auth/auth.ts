import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected loginData = {
    identifier: '',
    contrasena: ''
  };

  protected registerData = {
    nombre: '',
    contrasena: ''
  };

  protected feedback = '';

  protected onLogin(): void {
    this.feedback = '';
    this.authService.login(this.loginData.identifier, this.loginData.contrasena).subscribe({
      next: () => {
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        this.feedback = err.error?.message ?? 'No fue posible iniciar sesión.';
      }
    });
  }

  protected onRegister(): void {
    this.feedback = '';
    const payload = {
      nombre: this.registerData.nombre,
      contrasena: this.registerData.contrasena,
      generosFav: [],
      sobreMi: ''
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        this.feedback = err.error?.message ?? 'No fue posible crear la cuenta.';
      }
    });
  }
}
