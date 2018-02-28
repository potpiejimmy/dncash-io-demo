import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { RegisterComponent }  from './routes/register';
import { AccountComponent } from './routes/account';
import { TokenComponent } from './routes/token';

export const routes: Routes = [
    {path: '', component: AccountComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'token', component: TokenComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
