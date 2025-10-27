import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { TopMoversComponent } from './top-movers/components/top-movers/top-movers.component';
import { ListCoinsComponent } from './coins/components/list-coins/list-coins.component';
import { DetailComponent } from './coin-detail/components/detail/detail.component';

export const routes: Routes = [
  {
    path: 'menu',
    component: MenuComponent,
    children: [
      { path: '', redirectTo: 'top-movers', pathMatch: 'full' }, // default hijo
      { path: 'top-movers', component: TopMoversComponent },
      {path: 'monedas', component: ListCoinsComponent},
      { path: 'moneda/:id', loadComponent: () => import('./coin-detail/components/detail/detail.component').then(m => m.DetailComponent) },
    ]
  },
  { path: '', redirectTo: 'menu/top-movers', pathMatch: 'full' },
  { path: '**', redirectTo: 'menu/top-movers' }
];
