import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ArticlesComponent } from './pages/articles/articles';
import { ArticleDetailComponent } from './pages/article-detail/article-detail';
import { ReviewsComponent } from './pages/reviews/reviews';
import { ReviewDetailComponent } from './pages/review-detail/review-detail';
import { ProfilePageComponent } from './pages/profile/profile-page';
import { AuthComponent } from './pages/auth/auth';
import { UserArticlesComponent } from './pages/user-articles/user-articles';
import { ArticleCreateComponent } from './pages/article-create/article-create';
import { ReviewCreateComponent } from './pages/review-create/review-create';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articulos', component: ArticlesComponent },
  { path: 'articulos/:slug', component: ArticleDetailComponent },
  { path: 'resenas', component: ReviewsComponent },
  { path: 'resenas/crear', component: ReviewCreateComponent },
  { path: 'resenas/:reviewId', component: ReviewDetailComponent },
  { path: 'perfil', component: ProfilePageComponent },
  { path: 'mis-articulos', component: UserArticlesComponent },
  { path: 'mis-articulos/crear', component: ArticleCreateComponent },
  { path: 'login', component: AuthComponent },
  { path: '**', redirectTo: '' }
];
