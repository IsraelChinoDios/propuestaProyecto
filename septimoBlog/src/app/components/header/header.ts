import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  @Input() logo = '';
  @Input() navigation: NavigationItem[] = [];
  @Input() active?: string;
}
