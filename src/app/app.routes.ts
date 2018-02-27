import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { RegisterComponent }  from './routes/register';
import { AccountComponent } from './routes/account';

export const routes: Routes = [
    {path: '', component: AccountComponent},
    {path: 'register', component: RegisterComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
