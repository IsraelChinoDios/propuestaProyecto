import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserSession } from '../../models/article';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  @Input({ required: true }) user!: UserSession;
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;

  protected editingSobreMi = false;
  protected editingGeneros = false;
  protected sobreMiDraft = '';
  protected generosDraft = '';

  protected toggleSobreMi(): void {
    this.editingSobreMi = !this.editingSobreMi;
    this.sobreMiDraft = this.user.sobreMi ?? '';
  }

  protected toggleGeneros(): void {
    this.editingGeneros = !this.editingGeneros;
    this.generosDraft = this.user.generosFav.join(', ');
  }

  protected saveSobreMi(): void {
    const payload = { sobreMi: this.sobreMiDraft };
    this.userService.updateUser(this.user._id, payload).subscribe({
      next: (user) => {
        this.user = user;
        this.authService.updateStoredUser(user);
        this.editingSobreMi = false;
      },
      error: (err) => console.error(err)
    });
  }

  protected saveGeneros(): void {
    const generos = this.generosDraft
      .split(',')
      .map((genre) => genre.trim())
      .filter(Boolean);

    this.userService.updateUser(this.user._id, { generosFav: generos }).subscribe({
      next: (user) => {
        this.user = user;
        this.authService.updateStoredUser(user);
        this.editingGeneros = false;
      },
      error: (err) => console.error(err)
    });
  }

  protected openAvatarPicker(): void {
    this.avatarInput?.nativeElement.click();
  }

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result as string;
      this.userService.updateUser(this.user._id, { avatar }).subscribe({
        next: (user) => {
          this.user = user;
          this.authService.updateStoredUser(user);
        },
        error: (err) => console.error(err)
      });
    };
    reader.readAsDataURL(file);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/perfil']);
  }
}
